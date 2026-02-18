import { Search, HelpCircle, Settings, List, Maximize2, AlertCircle, Copy, FileText, Plus } from 'lucide-react'
import Image from 'next/image'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#c5c3d1] p-1 sm:p-3 md:p-4 lg:p-6 font-sans">
      <div className="mx-auto max-w-[1400px] rounded-xl sm:rounded-2xl lg:rounded-3xl bg-[#f5f4f0] p-3 sm:p-4 lg:p-6 shadow-2xl">
        {/* Header */}
        <header className="mb-3 sm:mb-4 lg:mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-semibold text-black">UXBooster</span>
          </div>

          <nav className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
            <button className="rounded-full px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-black transition-colors hover:bg-gray-200">
              Dashboard
            </button>
            <button className="rounded-full bg-black px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white">
              Projects
            </button>
            <button className="rounded-full px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-black transition-colors hover:bg-gray-200">
              Insights
            </button>
            <button className="rounded-full px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-black transition-colors hover:bg-gray-200">
              History
            </button>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-gray-200">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-gray-200">
              <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <div className="h-7 w-7 sm:h-9 sm:w-9 overflow-hidden rounded-full bg-gradient-to-br from-pink-400 to-orange-400">
              <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y0YTI2MSIvPjwvc3ZnPg==')] bg-cover" />
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Left Column - Overview */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4">
            {/* Radar Chart Card */}
            <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-black">Overview</h2>
                <button className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg hover:bg-gray-100">
                  <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>

              {/* Radar Chart */}
              <div className="relative mb-3 sm:mb-4 flex h-40 sm:h-52 items-center justify-center">
                <svg viewBox="0 0 300 300" className="h-full w-full">
                  {/* Grid circles */}
                  <circle cx="150" cy="150" r="120" fill="none" stroke="#e5e5e5" strokeWidth="1" />
                  <circle cx="150" cy="150" r="90" fill="none" stroke="#e5e5e5" strokeWidth="1" />
                  <circle cx="150" cy="150" r="60" fill="none" stroke="#e5e5e5" strokeWidth="1" />
                  <circle cx="150" cy="150" r="30" fill="none" stroke="#e5e5e5" strokeWidth="1" />
                  
                  {/* Grid lines */}
                  <line x1="150" y1="30" x2="150" y2="270" stroke="#e5e5e5" strokeWidth="1" />
                  <line x1="30" y1="150" x2="270" y2="150" stroke="#e5e5e5" strokeWidth="1" />
                  <line x1="63" y1="63" x2="237" y2="237" stroke="#e5e5e5" strokeWidth="1" />
                  <line x1="237" y1="63" x2="63" y2="237" stroke="#e5e5e5" strokeWidth="1" />
                  <line x1="97" y1="47" x2="203" y2="253" stroke="#e5e5e5" strokeWidth="1" />
                  <line x1="253" y1="97" x2="47" y2="203" stroke="#e5e5e5" strokeWidth="1" />
                  <line x1="253" y1="203" x2="47" y2="97" stroke="#e5e5e5" strokeWidth="1" />
                  
                  {/* Data polygon */}
                  <polygon
                    points="150,44 220,91 211,173 150,227 77,198 68,98 150,44"
                    fill="rgba(16, 185, 129, 0.15)"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  
                  {/* Data points */}
                  <circle cx="150" cy="44" r="4" fill="#10b981" />
                  <circle cx="220" cy="91" r="4" fill="#10b981" />
                  <circle cx="211" cy="173" r="4" fill="#10b981" />
                  <circle cx="150" cy="227" r="4" fill="#10b981" />
                  <circle cx="77" cy="198" r="4" fill="#10b981" />
                  <circle cx="68" cy="98" r="4" fill="#10b981" />
                  
                  {/* Labels */}
                  <text x="150" y="20" textAnchor="middle" className="fill-black text-xs font-medium">1</text>
                  <text x="250" y="100" textAnchor="start" className="fill-black text-xs font-medium">2</text>
                  <text x="250" y="200" textAnchor="start" className="fill-black text-xs font-medium">3</text>
                  <text x="150" y="290" textAnchor="middle" className="fill-black text-xs font-medium">4</text>
                  <text x="50" y="235" textAnchor="end" className="fill-black text-xs font-medium">5</text>
                  <text x="35" y="200" textAnchor="end" className="fill-black text-xs font-medium">6</text>
                  <text x="35" y="100" textAnchor="end" className="fill-black text-xs font-medium">7</text>
                </svg>
              </div>

              {/* Metrics List */}
              <div className="space-y-2 sm:space-y-2.5">
                <MetricRow number="1" label="Similarity" value="78%" color="bg-emerald-500" />
                <MetricRow number="2" label="Consistency" value="57%" color="bg-yellow-400" />
                <MetricRow number="3" label="Clarity" value="46%" color="bg-orange-500" />
                <MetricRow number="4" label="Cognitive demand" value="72%" color="bg-yellow-400" />
                <MetricRow number="5" label="Focus" value="62%" color="bg-orange-500" />
                <MetricRow number="6" label="Engagement" value="77%" color="bg-emerald-500" />
                <MetricRow number="7" label="Time consumption" value="81%" color="bg-emerald-600" />
              </div>
            </div>

            {/* Upgrade Card */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 sm:p-6 text-white shadow-lg">
              <div className="relative z-10">
                <h3 className="mb-1 text-xl sm:text-2xl font-bold">Upgrade</h3>
                <p className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold opacity-90">your plan</p>
                <button className="rounded-full bg-white px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-emerald-600 transition-transform hover:scale-105">
                  Go Premium
                </button>
              </div>
              <div className="absolute -right-4 sm:-right-8 bottom-4 sm:bottom-0">
                <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-20">
                  <circle cx="60" cy="60" r="50" fill="white" fillOpacity="0.3" />
                  <circle cx="75" cy="45" r="35" fill="white" fillOpacity="0.2" />
                  <circle cx="85" cy="60" r="25" fill="white" fillOpacity="0.25" />
                </svg>
              </div>
              <div className="absolute right-6 sm:right-10 top-6 sm:top-10 opacity-30">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="white" className="h-10 w-10 sm:h-12 sm:w-12">
                  <rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor" />
                  <rect x="2" y="9" width="20" height="3" fill="white" fillOpacity="0.3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Middle Column - Recent Project */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            {/* Recent Project Card */}
            <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm sm:text-base font-semibold text-black">Recent project</h2>
                  <button className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg hover:bg-gray-100 bg-gray-50">
                    <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <button className="rounded-full bg-black px-2.5 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] font-medium text-white">
                    Standard view
                  </button>
                  <button className="hidden sm:block rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] font-medium text-gray-600 hover:bg-gray-100">
                    Heatmap
                  </button>
                  <button className="rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] font-medium text-gray-600 hover:bg-gray-100">
                    Insights
                  </button>
                  <button className="rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] font-medium text-gray-600 hover:bg-gray-100">
                    Skeleton view
                  </button>
                  <button className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg hover:bg-gray-100 bg-gray-50">
                    <List className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
              </div>

              {/* Project Content */}
              <div className="relative flex h-[280px] sm:h-[350px] items-center justify-center rounded-lg sm:rounded-xl bg-gray-50 p-4 sm:p-8 overflow-hidden">
                {/* Background Image */}
                <img 
                  src="/project-illustration.jpg" 
                  alt="UX Project Illustration" 
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute left-2 sm:left-4 top-2 sm:top-4 flex items-center gap-1.5 sm:gap-2 z-10">
                  <div className="rounded-md border-2 border-gray-300 p-1 sm:p-1.5 bg-white/80 backdrop-blur-sm">
                    <List className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <div className="rounded-md border-2 border-gray-300 p-1 sm:p-1.5 bg-white/80 backdrop-blur-sm">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                </div>

                <div className="absolute right-2 sm:right-4 top-2 sm:top-4 rounded-full bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm z-10">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-[9px] sm:text-[10px] font-medium">About</span>
                    <span className="text-[9px] sm:text-[10px] font-medium">Blog</span>
                    <span className="rounded-full bg-black px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-white">View More</span>
                  </div>
                </div>

                <button className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border-2 border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white z-10">
                  <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            </div>

            {/* AI Reports Card */}
            <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-black">AI reports</h2>
                <button className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg hover:bg-gray-100">
                  <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <ReportCircle iconType="chart" label="Competitors" />
                <ReportCircle iconType="list" label="Task flow" />
                <ReportCircle iconType="book" label="User journey" />
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            {/* Transfer Flow Card */}
            <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
              <div className="mb-1 text-[10px] sm:text-xs font-medium text-gray-600">Transfer flow</div>
              <div className="mb-2 sm:mb-3 text-3xl sm:text-4xl font-bold text-black">87%</div>
              <div className="inline-block rounded-full bg-emerald-500 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white">
                GOOD
              </div>
            </div>

            {/* Request Flow Card */}
            <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
              <div className="mb-1 text-[10px] sm:text-xs font-medium text-gray-600">Request flow</div>
              <div className="mb-2 sm:mb-3 text-3xl sm:text-4xl font-bold text-black">52%</div>
              <div className="mb-2 sm:mb-3 inline-block rounded-full bg-orange-500 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white">
                ATTENTION!
              </div>
              <div className="mt-2 sm:mt-3 flex items-start gap-1.5 rounded-lg bg-gray-50 p-2">
                <AlertCircle className="mt-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                <p className="text-[9px] sm:text-[10px] leading-relaxed text-gray-700">
                  QR code for requesting funds is valid for only 1 minute.
                </p>
              </div>
            </div>

            {/* Cascade Banking Card */}
            <div className="rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 bg-white p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-center">
                <button className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full hover:bg-gray-50">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl bg-white p-2.5 sm:p-3 shadow-sm">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="font-medium text-black">Cascade banking</span>
                <span className="text-gray-500">24 screens</span>
              </div>
            </div>

            {/* Passing Rate Card */}
            <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-black">Passing rate</h2>
                <button className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg hover:bg-gray-100">
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="mb-0.5 sm:mb-1 text-[9px] sm:text-[10px] text-gray-600">Complete</div>
                  <div className="text-xl sm:text-2xl font-bold text-black">61%</div>
                </div>
                <div>
                  <div className="mb-0.5 sm:mb-1 text-[9px] sm:text-[10px] text-gray-600">Failed</div>
                  <div className="text-xl sm:text-2xl font-bold text-black">17%</div>
                </div>
                <div>
                  <div className="mb-0.5 sm:mb-1 text-[9px] sm:text-[10px] text-gray-600">Partial</div>
                  <div className="text-xl sm:text-2xl font-bold text-black">22%</div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 flex h-2 sm:h-2.5 overflow-hidden rounded-full">
                <div className="w-[61%] bg-emerald-500" />
                <div className="w-[17%] bg-orange-500" />
                <div className="w-[22%] bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ number, label, value, color }: { number: string; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="w-3 text-[10px] sm:text-xs font-medium text-gray-600">{number}</span>
      <span className="flex-1 text-[10px] sm:text-xs text-black">{label}</span>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <div className="h-1.5 w-10 sm:w-12 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full ${color}`} style={{ width: value }} />
        </div>
        <span className="w-7 sm:w-8 text-right text-[10px] sm:text-xs font-semibold text-black">{value}</span>
      </div>
    </div>
  )
}

function ReportCircle({ iconType, label }: { iconType: 'chart' | 'list' | 'book'; label: string }) {
  const renderIcon = () => {
    switch (iconType) {
      case 'chart':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 10v7M12 7v10M16 13v4" />
          </svg>
        )
      case 'list':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
            <rect x="3" y="5" width="18" height="4" rx="1" />
            <rect x="3" y="11" width="18" height="4" rx="1" />
            <rect x="3" y="17" width="18" height="4" rx="1" />
          </svg>
        )
      case 'book':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M12 6v8M9 10h6" />
          </svg>
        )
    }
  }

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-1.5 sm:mb-2 flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center">
        {/* Circular progress */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="283"
            strokeDashoffset="70"
            strokeLinecap="round"
          />
        </svg>
        <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-white shadow-sm">
          {renderIcon()}
        </div>
      </div>
      <div className="text-[10px] sm:text-xs font-medium text-black">{label}</div>
    </div>
  )
}
