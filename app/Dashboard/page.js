'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, MessageCircle, Users, MessageSquare, Home, Calendar, MoreHorizontal, Edit2, Settings, X, Upload, Star, Check } from 'lucide-react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [supportOpen, setSupportOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [members, setMembers] = useState([])
  const router = useRouter()

  // Form state for adding new member
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomorAnggota: '',
    alamat: '',
    nomorTelepon: '',
    password: '',
    photo: null
  })

  const handleLogout = () => {
    router.push('/')
  }

  const handleAddMember = (e) => {
    e.preventDefault()
    const newMember = {
      id: members.length + 1,
      name: formData.nama,
      nra: formData.nomorAnggota,
      email: formData.email,
      alamat: formData.alamat,
      nomorTelepon: formData.nomorTelepon,
      avatar: formData.nama.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(),
      photo: formData.photo
    }
    setMembers([...members, newMember])
    setShowAddModal(false)
    setFormData({
      nama: '',
      email: '',
      nomorAnggota: '',
      alamat: '',
      nomorTelepon: '',
      password: '',
      photo: null
    })
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    setFormData({
      ...formData,
      [name]: files ? URL.createObjectURL(files[0]) : value
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setFormData({
        ...formData,
        photo: URL.createObjectURL(file)
      })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, active: true, href: '/Dashboard' },
    { name: 'Member Management', icon: Users, active: false, href: '/members' },
    { name: 'Event Management', icon: Calendar, active: false, href: '/events' },
    { name: 'Forum', icon: MessageSquare, active: false, href: '/forum' },
    { name: 'System Settings', icon: Settings, active: false, href: '/settings' },
    { name: 'Features', icon: Star, badge: 'NEW', active: false, href: '/features' }
  ]

  const forumEvents = [
    {
      title: 'EVENT IDSECCONF 2025',
      description: 'Selamat datang ke hari pertama registration Event conference IDSECCONF di Indonesia.',
      author: 'Syarif Rahman',
      timestamp: '2 jam yang lalu',
      avatars: ['/api/placeholder/32/32', '/api/placeholder/32/32', '/api/placeholder/32/32'],
      comments: '15 comments'
    },
    {
      title: 'Cybersecurity Workshop 2025',
      description: 'Diskusi tentang tren keamanan siber terbaru dan praktik terbaik.',
      author: 'Ahmad Fadli',
      timestamp: '4 jam yang lalu',
      avatars: ['/api/placeholder/32/32', '/api/placeholder/32/32'],
      comments: '9 comments'
    },
    {
      title: 'Tech Talk: AI in Security',
      description: 'Eksplorasi peran AI dalam meningkatkan keamanan digital.',
      author: 'Budi Santoso',
      timestamp: '1 hari yang lalu',
      avatars: ['/api/placeholder/32/32', '/api/placeholder/32/32', '/api/placeholder/32/32'],
      comments: '12 comments'
    }
  ]

  const memberStats = {
    totalMembers: 245,
    eventsActive: 8
  }

  const upcomingEvents = [
    {
      title: 'Workshop Cybersecurity',
      date: '2025-08-25',
      location: 'Jakarta',
      registered: 120
    },
    {
      title: 'IDSECCONF 2025',
      date: '2025-09-10',
      location: 'Bali',
      registered: 200
    },
    {
      title: 'AI Security Summit',
      date: '2025-10-15',
      location: 'Bandung',
      registered: 85
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-slate-800 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SR</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Syarif Rahman</h3>
              </div>
            </div>
          </div>
          
          <nav className="mt-6">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name)
                  setIsSidebarOpen(false)
                  if (item.href) router.push(item.href)
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-slate-700 transition-colors ${
                  activeTab === item.name ? 'bg-blue-600 border-r-2 border-blue-400' : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="text-sm">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-green-500 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64">
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-800">
                Hey, Obo! Great to have you on board 🥰
              </h1>
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Log out
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col lg:flex-row">
            <div className="flex-1 p-6">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold mb-4">Welcome to Your Command Center</h2>
                  <p className="text-blue-100 text-lg mb-6">
                    Manage members, events, and forums with ease. Stay updated with the latest activities and take quick actions to keep your community thriving.
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-300" />
                      <span className="text-sm">{memberStats.totalMembers} Total Members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-yellow-300" />
                      <span className="text-sm">{memberStats.eventsActive} Active Events</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-orange-300" />
                      <span className="text-sm">3 New Features</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Members</p>
                      <p className="text-3xl font-bold text-gray-900">{memberStats.totalMembers}</p>
                      <p className="text-sm text-green-600 mt-1">+8% dari bulan lalu</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Events Active</p>
                      <p className="text-3xl font-bold text-gray-900">{memberStats.eventsActive}</p>
                      <p className="text-sm text-purple-600 mt-1">3 upcoming</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <h4 className="text-sm font-medium text-gray-800">{event.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">Date: {event.date}</p>
                      <p className="text-xs text-gray-600">Location: {event.location}</p>
                      <p className="text-xs text-gray-600">Registered: {event.registered}</p>
                      <button 
                        onClick={() => router.push('/events')}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">Event "Workshop Cybersecurity" berhasil dibuat</p>
                      <p className="text-xs text-gray-500">4 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">15 pesan baru di forum diskusi</p>
                      <p className="text-xs text-gray-500">6 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">Reminder: Event IDSECCONF besok</p>
                      <p className="text-xs text-gray-500">1 hari yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">Ahmad Fadli bergabung sebagai member baru</p>
                      <p className="text-xs text-gray-500">2 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">New feature "AI-Powered Insights" added</p>
                      <p className="text-xs text-gray-500">1 jam yang lalu</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">Add New Member</span>
                  </button>
                  <button 
                    onClick={() => router.push('/events')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">Create Event</span>
                  </button>
                  <button 
                    onClick={() => router.push('/forum')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">Manage Forums</span>
                  </button>
                  <button 
                    onClick={() => router.push('/features')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-yellow-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">View Features</span>
                  </button>
                  <button 
                    onClick={() => router.push('/settings')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">System Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Forum Sidebar */}
            <div className="w-full lg:w-80 bg-white border-l p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Forum</h2>
                <button 
                  onClick={() => router.push('/forum')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {forumEvents.map((event, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded">Event</span>
                        <h3 className="font-medium text-sm text-gray-800 mt-1">{event.title}</h3>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                      {event.description}
                    </p>
                    <p className="text-xs text-gray-500">By {event.author} • {event.timestamp}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white"></div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <MessageCircle className="w-3 h-3" />
                        <span className="text-xs">{event.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6">
            <button 
              onClick={() => setSupportOpen(!supportOpen)}
              className="bg-slate-700 hover:bg-slate-800 text-white p-3 rounded-full shadow-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            {supportOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Support
              </div>
            )}
          </div>

          {/* Add Member Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 sm:p-6">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg transform transition-all duration-300 scale-100 hover:scale-[1.01] overflow-y-auto max-h-[90vh]">
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Add New Member</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddMember} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        {formData.photo ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={formData.photo}
                              alt="Preview"
                              className="w-20 h-20 rounded-full object-cover mb-3 border border-gray-200"
                            />
                            <p className="text-sm text-gray-500">Drag or click to replace</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Drag & drop an image here or click to upload</p>
                          </div>
                        )}
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="mt-3 inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
                        >
                          Select Photo
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nama</label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Anggota</label>
                      <input
                        type="text"
                        name="nomorAnggota"
                        value={formData.nomorAnggota}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Tempat Tinggal</label>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                      <input
                        type="tel"
                        name="nomorTelepon"
                        value={formData.nomorTelepon}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm"
                      >
                        Add Member
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}