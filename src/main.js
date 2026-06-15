import Alpine from "alpinejs"
import { createIcons, icons as lucideIcons } from "lucide"
import { popularIcons, brandIconUrl, faviconUrl, fetchSvgIcons } from "./icons.js"
import { formatTime, formatDate } from "./clock.js"
import { weatherFromCode, fetchCity, getCachedWeather, setCachedWeather } from "./weather.js"
import { refreshDnD } from "./dnd.js"

function afterRender() {
  Alpine.nextTick(() => createIcons({ icons: lucideIcons }))
  refreshDnD()
}

document.addEventListener("alpine:init", () => {
  Alpine.data("app", () => ({
    // Data
    company: {},
    settings: {},
    fixedSections: [],
    sections: [],
    customizations: { addedSections: [], editedSections: {}, addedLinks: {}, linkOrder: {}, hiddenSections: [], hiddenLinks: {} },

    // UI state
    activeTab: null,
    timeStr: "",
    dateStr: "",
    temperature: null,
    city: "",
    weatherDesc: "",
    weatherLucide: "sun",
    theme: "light",
    iconStyle: "official",
    brandDynamicSvg: {},

    // Section modal
    sectionModalOpen: false,
    sectionModalMode: "add",
    sectionModalTarget: null,
    sectionModalName: "",
    sectionModalDescription: "",
    sectionModalColor: "#4f46e5",

    // Link modal
    linkModalOpen: false,
    linkModalMode: "add",
    linkModalSectionId: null,
    linkModalTarget: null,
    linkModalName: "",
    linkModalUrl: "",
    linkModalIcon: "",
    linkModalDescription: "",
    iconSearch: "",
    popularIcons,

    // Debug mode
    debugMode: true,
    showDebugSettings: false,
    editDraft: {},
    originalDefaults: {},

    async init() {
      const [linksRes, settingsRes] = await Promise.all([
        fetch("links.json"),
        fetch("settings.json"),
      ])
      const data = await linksRes.json()
      const defaultSettings = await settingsRes.json()
      this.company = data.company || {}
      this.fixedSections = data.sections || []
      if (!defaultSettings.logo && this.company.logo) {
        defaultSettings.logo = this.company.logo
        defaultSettings.logoAlt = this.company.logoAlt || ""
      }

      const saved = localStorage.getItem("stacklinks")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          this.customizations = parsed.customizations || { addedSections: [], editedSections: {}, addedLinks: {}, linkOrder: {}, hiddenSections: [], hiddenLinks: {} }
          this.theme = parsed.theme || "light"
          this.iconStyle = parsed.iconStyle || "official"
          if (parsed.settings) {
            defaultSettings.greeting = parsed.settings.greeting ?? defaultSettings.greeting
            defaultSettings.logo = parsed.settings.logo ?? defaultSettings.logo
            defaultSettings.logoAlt = parsed.settings.logoAlt ?? defaultSettings.logoAlt
            defaultSettings.defaultColor = parsed.settings.defaultColor ?? defaultSettings.defaultColor
            if (parsed.settings.dateFormat && !/[Hms]/.test(parsed.settings.dateFormat)) {
              defaultSettings.dateFormat = parsed.settings.dateFormat
            }
            defaultSettings.timeFormat = parsed.settings.timeFormat ?? defaultSettings.timeFormat
            defaultSettings.showDate = parsed.settings.showDate ?? defaultSettings.showDate
            defaultSettings.showTime = parsed.settings.showTime ?? defaultSettings.showTime
            defaultSettings.gridColumns = parsed.settings.gridColumns ?? defaultSettings.gridColumns
            defaultSettings.linksPerRow = parsed.settings.linksPerRow ?? defaultSettings.linksPerRow
            defaultSettings.showLinkNames = parsed.settings.showLinkNames ?? defaultSettings.showLinkNames
            if (parsed.settings.features) {
              Object.assign(defaultSettings.features, parsed.settings.features)
            }
            if (parsed.settings.colors) {
              defaultSettings.colors = {
                light: { ...defaultSettings.colors?.light, ...parsed.settings.colors?.light },
                dark: { ...defaultSettings.colors?.dark, ...parsed.settings.colors?.dark },
              }
            }
          }
          if (parsed.activeTab) this.activeTab = parsed.activeTab
        } catch {
          // ignore corrupt data
        }
      }

      this.originalDefaults = JSON.parse(JSON.stringify(defaultSettings))
      this.settings = defaultSettings
      const defColor = this.settings.defaultColor || "#4f46e5"
      this.sectionModalColor = defColor
      this.applyTheme()
      this.mergeData()
      this.updateClock()
      setInterval(() => this.updateClock(), 1000)
      if (this.settings.features?.weather) this.fetchWeather()
      this.prefetchDynamicIcons()
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "D") {
          e.preventDefault()
          if (this.debugMode) this.debugMode = false
        }
      })
      document.body.addEventListener("links-reordered", (e) => {
        this.customizations.linkOrder[this.activeTab] = e.detail.linkIds.filter(Boolean)
        this.saveToStorage()
      })
      afterRender()
    },

    // ---- Data merge ----
    mergeData() {
      const map = {}
      const hiddenSections = new Set(this.customizations.hiddenSections || [])
      for (const sec of this.fixedSections) {
        if (hiddenSections.has(sec.id)) continue
        const clone = JSON.parse(JSON.stringify(sec))
        const edits = this.customizations.editedSections[sec.id]
        if (edits) {
          if (edits.name) clone.name = edits.name
          if (edits.color) clone.color = edits.color
        }
        const hiddenKeys = new Set(this.customizations.hiddenLinks?.[sec.id] || [])
        if (hiddenKeys.size) {
          clone.links = clone.links.filter(l => !hiddenKeys.has(l.id || (l.name + '|' + l.url)))
        }
        const added = this.customizations.addedLinks[sec.id]
        if (added && added.length) {
          const toAdd = hiddenKeys.size ? added.filter(l => !hiddenKeys.has(l.id || (l.name + '|' + l.url))) : added
          clone.links.push(...JSON.parse(JSON.stringify(toAdd)))
        }
        map[sec.id] = clone
      }
      for (const sec of this.customizations.addedSections) {
        if (hiddenSections.has(sec.id)) continue
        const clone = JSON.parse(JSON.stringify(sec))
        const hiddenKeys = new Set(this.customizations.hiddenLinks?.[sec.id] || [])
        const added = this.customizations.addedLinks[sec.id]
        if (added && added.length) {
          const toAdd = hiddenKeys.size ? added.filter(l => !hiddenKeys.has(l.id || (l.name + '|' + l.url))) : added
          clone.links.push(...JSON.parse(JSON.stringify(toAdd)))
        }
        map[sec.id] = clone
      }
      const order = this.customizations.sectionOrder
      if (order && order.length) {
        const ordered = []
        const seen = new Set()
        for (const id of order) {
          if (map[id]) { ordered.push(map[id]); seen.add(id) }
        }
        for (const [id, sec] of Object.entries(map)) {
          if (!seen.has(id)) ordered.push(sec)
        }
        this.sections = ordered
      } else {
        this.sections = Object.values(map)
      }
      if (!this.activeTab || !this.sections.some((s) => s.id === this.activeTab)) {
        this.activeTab = this.sections.length > 0 ? this.sections[0].id : null
      }
      // Apply link order per section
      for (const sec of this.sections) {
        const order = this.customizations.linkOrder?.[sec.id]
        if (order && order.length) {
          const ordered = []
          const seen = new Set()
          for (const key of order) {
            const link = sec.links.find((l) => this.linkKey(l) === key)
            if (link) { ordered.push(link); seen.add(key) }
          }
          for (const link of sec.links) {
            if (!seen.has(this.linkKey(link))) ordered.push(link)
          }
          sec.links = ordered
        }
      }
    },

    saveToStorage() {
      localStorage.setItem(
        "stacklinks",
        JSON.stringify({
          customizations: this.customizations,
          theme: this.theme,
          iconStyle: this.iconStyle,
          settings: this.settings,
          activeTab: this.activeTab,
        })
      )
    },

    // ---- Icons ----
    brandIconUrl(slug, sectionColor) {
      return brandIconUrl(slug, sectionColor, this.iconStyle)
    },

    faviconUrl(link) {
      return faviconUrl(link)
    },

    async prefetchDynamicIcons() {
      const slugs = new Set()
      for (const sec of this.sections) {
        for (const link of sec.links) {
          if (link.icon) slugs.add(link.icon)
        }
      }
      this.brandDynamicSvg = await fetchSvgIcons(slugs)
    },

    cycleIconStyle() {
      if (!this.settings.features?.iconStyleSwitch) return
      const modes = ["official", "section", "dynamic"]
      const idx = modes.indexOf(this.iconStyle)
      this.iconStyle = modes[(idx + 1) % modes.length]
      this.saveToStorage()
      afterRender()
    },

    // ---- Clock ----
    updateClock() {
      this.timeStr = formatTime(this.settings.timeFormat || "HH:mm")
      this.dateStr = formatDate(this.settings.dateFormat || "DD/MM/YYYY")
    },

    // ---- Weather ----
    fetchWeather() {
      if (!navigator.geolocation) return

      const cached = getCachedWeather()
      if (cached) {
        this.temperature = cached.temperature
        this.city = cached.city || ""
        this.weatherDesc = cached.weatherDesc
        this.weatherLucide = cached.weatherLucide
        return
      }

      localStorage.removeItem("weather_cache")
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          )
            .then((r) => r.json())
            .then(async (d) => {
              const { icon, desc } = weatherFromCode(
                d.current_weather.weathercode,
                d.current_weather.is_day
              )
              const city = await fetchCity(latitude, longitude)
              const temp = Math.round(d.current_weather.temperature)

              const wd = { temperature: temp, city, weatherDesc: desc, weatherLucide: icon }
              setCachedWeather(wd)
              this.temperature = temp
              this.city = city
              this.weatherDesc = desc
              this.weatherLucide = icon
              afterRender()
            })
            .catch(() => {})
        },
        () => {}
      )
    },

    // ---- Theme ----
    applyTheme() {
      const isDark = this.theme === "dark"
      document.documentElement.classList.toggle("dark", isDark)
      const colors = this.settings.colors?.[isDark ? "dark" : "light"]
      if (colors) {
        const root = document.documentElement
        root.style.setProperty("--color-bg", colors.bg)
        root.style.setProperty("--color-surface", colors.surface)
        root.style.setProperty("--color-text", colors.text)
        root.style.setProperty("--color-accent", colors.accent)
      }
    },

    toggleTheme() {
      if (!this.settings.features?.darkMode) return
      this.theme = this.theme === "dark" ? "light" : "dark"
      this.applyTheme()
      this.saveToStorage()
      afterRender()
    },

    // ---- Section CRUD ----
    openAddSectionModal() {
      this.sectionModalMode = "add"
      this.sectionModalTarget = null
      this.sectionModalName = ""
      this.sectionModalDescription = ""
      this.sectionModalColor = this.settings.defaultColor || "#4f46e5"
      this.sectionModalOpen = true
    },

    openEditSectionModal(section) {
      this.sectionModalMode = "edit"
      this.sectionModalTarget = section
      this.sectionModalName = section.name
      this.sectionModalDescription = section.description || ""
      this.sectionModalColor = section.color
      this.sectionModalOpen = true
    },

    closeSectionModal() {
      this.sectionModalOpen = false
      this.sectionModalTarget = null
    },

    saveSectionModal() {
      const name = this.sectionModalName.trim()
      if (!name) return

      if (this.sectionModalMode === "add") {
        const id = `sec_${Date.now()}`
        this.customizations.addedSections.push({
          id,
          name,
          description: this.sectionModalDescription.trim() || "",
          color: this.sectionModalColor,
          fixed: false,
          links: [],
        })
      } else {
        const section = this.sectionModalTarget
        const desc = this.sectionModalDescription.trim()
        section.name = name
        section.color = this.sectionModalColor
        section.description = desc || ""

        const customSec = this.customizations.addedSections.find((s) => s.id === section.id)
        if (customSec) {
          customSec.name = name
          customSec.color = this.sectionModalColor
          customSec.description = desc || ""
        } else {
          this.customizations.editedSections[section.id] = { name, color: this.sectionModalColor, description: desc || "" }
        }
      }

      this.saveToStorage()
      this.mergeData()
      this.closeSectionModal()
      afterRender()
    },

    deleteSection(sectionId) {
      if (!confirm("Delete this section and all its links?")) return
      const isFixed = this.fixedSections.some((s) => s.id === sectionId)
      if (isFixed) {
        this.customizations.hiddenSections = this.customizations.hiddenSections || []
        this.customizations.hiddenSections.push(sectionId)
      } else {
        this.customizations.addedSections = this.customizations.addedSections.filter((s) => s.id !== sectionId)
        delete this.customizations.editedSections[sectionId]
        delete this.customizations.addedLinks[sectionId]
      }
      this.saveToStorage()
      this.mergeData()
      afterRender()
    },

    moveSectionUp(sectionId) {
      const ids = this.sections.map((s) => s.id)
      const idx = ids.indexOf(sectionId)
      if (idx <= 0) return
      ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
      this.customizations.sectionOrder = ids
      this.saveToStorage()
      this.mergeData()
      afterRender()
    },

    moveSectionDown(sectionId) {
      const ids = this.sections.map((s) => s.id)
      const idx = ids.indexOf(sectionId)
      if (idx < 0 || idx >= ids.length - 1) return
      ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
      this.customizations.sectionOrder = ids
      this.saveToStorage()
      this.mergeData()
      afterRender()
    },

    // ---- Link CRUD ----
    openAddLinkModal(sectionId) {
      this.linkModalMode = "add"
      this.linkModalSectionId = sectionId
      this.linkModalTarget = null
      this.linkModalName = ""
      this.linkModalUrl = ""
      this.linkModalIcon = ""
      this.linkModalDescription = ""
      this.iconSearch = ""
      this.linkModalOpen = true
      afterRender()
    },

    openEditLinkModal(link, sectionId) {
      this.linkModalMode = "edit"
      this.linkModalSectionId = sectionId
      this.linkModalTarget = link
      this.linkModalName = link.name
      this.linkModalUrl = link.url
      this.linkModalIcon = link.icon || ""
      this.linkModalDescription = link.description || ""
      this.iconSearch = link.icon || ""
      this.linkModalOpen = true
      afterRender()
    },

    closeLinkModal() {
      this.linkModalOpen = false
      this.linkModalTarget = null
      this.linkModalSectionId = null
    },

    saveLinkModal() {
      const name = this.linkModalName.trim()
      const url = this.linkModalUrl.trim()
      if (!name || !url) return
      const sectionId = this.linkModalSectionId

      if (this.linkModalMode === "add") {
        const id = `link_${Date.now()}`
        if (!this.customizations.addedLinks[sectionId]) {
          this.customizations.addedLinks[sectionId] = []
        }
        this.customizations.addedLinks[sectionId].push({
          id,
          name,
          url,
          icon: this.linkModalIcon.trim() || "",
          description: this.linkModalDescription.trim() || "",
        })
        // Append to link order
        const order = this.customizations.linkOrder[sectionId]
        if (order) order.push(id)
      } else {
        const links = this.customizations.addedLinks[sectionId]
        if (!links) return
        const link = links.find((l) => l.id === this.linkModalTarget.id)
        if (!link) return
        link.name = name
        link.url = url
        link.icon = this.linkModalIcon.trim() || ""
        link.description = this.linkModalDescription.trim() || ""
      }

      this.saveToStorage()
      this.mergeData()
      this.closeLinkModal()
      afterRender()
    },

    deleteLink(linkId, sectionId, link) {
      if (!confirm("Delete this link?")) return
      if (linkId) {
        const links = this.customizations.addedLinks[sectionId]
        if (!links) return
        this.customizations.addedLinks[sectionId] = links.filter((l) => l.id !== linkId)
        const order = this.customizations.linkOrder[sectionId]
        if (order) {
          this.customizations.linkOrder[sectionId] = order.filter((id) => id !== linkId)
        }
      } else if (link) {
        this.customizations.hiddenLinks = this.customizations.hiddenLinks || {}
        this.customizations.hiddenLinks[sectionId] = this.customizations.hiddenLinks[sectionId] || []
        this.customizations.hiddenLinks[sectionId].push(link.name + '|' + link.url)
      }
      this.saveToStorage()
      this.mergeData()
      afterRender()
    },

    moveLink(linkId, fromSectionId, toSectionId) {
      if (!toSectionId || fromSectionId === toSectionId) return
      const links = this.customizations.addedLinks[fromSectionId]
      if (!links) return
      const link = links.find((l) => l.id === linkId)
      if (!link) return
      this.customizations.addedLinks[fromSectionId] = links.filter((l) => l.id !== linkId)
      if (!this.customizations.addedLinks[toSectionId]) {
        this.customizations.addedLinks[toSectionId] = []
      }
      this.customizations.addedLinks[toSectionId].push(link)
      // Update link order for both sections
      const fromOrder = this.customizations.linkOrder[fromSectionId]
      if (fromOrder) {
        this.customizations.linkOrder[fromSectionId] = fromOrder.filter((id) => id !== linkId)
      }
      const toOrder = this.customizations.linkOrder[toSectionId]
      if (toOrder) {
        toOrder.push(linkId)
      }
      this.saveToStorage()
      this.mergeData()
      afterRender()
    },

    // ---- Import / Export ----
    exportData() {
      const data = {
        company: this.company,
        sections: this.fixedSections,
        customizations: this.customizations,
        theme: this.theme,
        iconStyle: this.iconStyle,
        settings: this.settings,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "stacklinks-export.json"
      a.click()
      URL.revokeObjectURL(url)
    },

    importData(event) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.customizations) {
            this.customizations = data.customizations
          }
          if (data.theme) {
            this.theme = data.theme
            this.applyTheme()
          }
          if (data.iconStyle) {
            this.iconStyle = data.iconStyle
          }
          if (data.settings) {
            this.settings = data.settings
          }
          this.saveToStorage()
      this.mergeData()
      this.activeTab = this.sections.length > 0 ? this.sections[0].id : null
          afterRender()
        } catch {
          alert("Invalid JSON file")
        }
      }
      reader.readAsText(file)
    },

    // ---- Debug mode ----
    toggleDebugMode() {
      this.debugMode = false
    },

    // ---- Debug settings modal ----
    openDebugSettings() {
      this.editDraft = JSON.parse(JSON.stringify(this.settings))
      this.showDebugSettings = true
    },

    closeDebugSettings() {
      this.showDebugSettings = false
    },

    saveDebugSettings() {
      this.settings = JSON.parse(JSON.stringify(this.editDraft))
      const defColor = this.settings.defaultColor || "#4f46e5"
      this.sectionModalColor = defColor
      this.saveToStorage()
      this.applyTheme()
      this.mergeData()
      if (this.settings.features?.weather) this.fetchWeather()
      this.showDebugSettings = false
      afterRender()
    },

    resetDebugSettings() {
      this.editDraft = JSON.parse(JSON.stringify(this.originalDefaults))
    },

    // ---- Utilities ----
    isCustomLink(link) {
      return !!link.id
    },

    linkKey(link) {
      return link.id || (link.name + '|' + link.url)
    },

    selectTab(sectionId) {
      this.activeTab = sectionId
      this.saveToStorage()
    },

    detectIconFromUrl() {
      try {
        const host = new URL(this.linkModalUrl).hostname.replace("www.", "")
        const guess = host.split(".")[0].toLowerCase()
        if (this.popularIcons.some((i) => i.slug === guess)) {
          this.linkModalIcon = guess
          this.iconSearch = guess
        }
      } catch { /* ignore */ }
    },

    filteredPopularIcons() {
      const q = this.iconSearch.toLowerCase().trim()
      return q
        ? this.popularIcons.filter((i) => i.slug.includes(q) || i.name.toLowerCase().includes(q))
        : this.popularIcons
    },

    selectIcon(slug) {
      this.linkModalIcon = slug
      this.iconSearch = slug
    },

    sectionsForMove(currentSectionId) {
      return this.sections.filter((s) => s.id !== currentSectionId)
    },
  }))
})

Alpine.start()
afterRender()
