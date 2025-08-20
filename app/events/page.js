'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  LogOut, 
  Plus, 
  Search, 
  Filter,
  Download,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Home, 
  MessageSquare, 
  Settings,
  X,
  Upload
} from 'lucide-react'

export default function EventsPage() {
  const [view, setView] = useState('grid') // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'IDSECCONF 2025',
      description: 'Conference terbesar di Indonesia tentang cybersecurity dan teknologi informasi. Event ini akan menghadirkan speaker-speaker terbaik dari dalam dan luar negeri.',
      date: '2025-03-15',
      time: '09:00',
      location: 'Jakarta Convention Center',
      maxParticipants: 500,
      currentParticipants: 324,
      category: 'Conference',
      status: 'Published',
      organizer: 'Syarif Rahman',
      price: 'Free',
      registrationDeadline: '2025-03-10',
      image: '/api/placeholder/300/200',
      tags: ['Cybersecurity', 'Technology', 'Networking']
    },
    {
      id: 2,
      title: 'Web Development Workshop',
      description: 'Workshop intensif untuk belajar web development dari dasar hingga mahir. Cocok untuk pemula yang ingin memulai karir sebagai web developer.',
      date: '2025-02-20',
      time: '10:00',
      location: 'Surabaya Tech Hub',
      maxParticipants: 50,
      currentParticipants: 32,
      category: 'Workshop',
      status: 'Published',
      organizer: 'Obo Wibowo',
      price: 'Rp 150.000',
      registrationDeadline: '2025-02-15',
      image: '/api/placeholder/300/200',
      tags: ['Web Development', 'Programming', 'Hands-on']
    },
    {
      id: 3,
      title: 'AI & Machine Learning Seminar',
      description: 'Seminar tentang perkembangan terbaru AI dan Machine Learning serta implementasinya dalam industri Indonesia.',
      date: '2025-04-10',
      time: '14:00',
      location: 'Bandung Digital Valley',
      maxParticipants: 200,
      currentParticipants: 89,
      category: 'Seminar',
      status: 'Draft',
      organizer: 'Jane Cooper',
      price: 'Rp 75.000',
      registrationDeadline: '2025-04-05',
      image: '/api/placeholder/300/200',
      tags: ['AI', 'Machine Learning', 'Innovation']
    },
    {
      id: 4,
      title: 'Career Fair Tech 2025',
      description: 'Job fair khusus untuk bidang teknologi. Bertemu langsung dengan HRD dari perusahaan tech terbaik di Indonesia.',
      date: '2025-05-25',
      time: '08:00',
      location: 'Yogyakarta Expo Center',
      maxParticipants: 1000,
      currentParticipants: 156,
      category: 'Career Fair',
      status: 'Published',
      organizer: 'Cody Fisher',
      price: 'Free',
      registrationDeadline: '2025-05-20',
      image: '/api/placeholder/300/200',
      tags: ['Career', 'Job Fair', 'Technology']
    },
    {
      id: 5,
      title: 'Mobile App Development Bootcamp',
      description: 'Bootcamp 3 hari untuk belajar pengembangan aplikasi mobile Android dan iOS. Dari konsep hingga publish ke store.',
      date: '2025-06-15',
      time: '09:00',
      location: 'Bali Startup Hub',
      maxParticipants: 30,
      currentParticipants: 18,
      category: 'Bootcamp',
      status: 'Published',
      organizer: 'Marvin McKinney',
      price: 'Rp 350.000',
      registrationDeadline: '2025-06-10',
      image: '/api/placeholder/300/200',
      tags: ['Mobile Development', 'Android', 'iOS']
    },
    {
      id: 6,
      title: 'Blockchain & Cryptocurrency Summit',
      description: 'Summit tentang teknologi blockchain dan cryptocurrency. Membahas tren, regulasi, dan masa depan digital currency di Indonesia.',
      date: '2025-07-20',
      time: '13:00',
      location: 'Online Event',
      maxParticipants: 300,
      currentParticipants: 67,
      category: 'Summit',
      status: 'Draft',
      organizer: 'Leslie Alexander',
      price: 'Rp 100.000',
      registrationDeadline: '2025-07-15',
      image: '/api/placeholder/300/200',
      tags: ['Blockchain', 'Cryptocurrency', 'Fintech']
    }
  ])
  const router = useRouter()

  // Form state for adding new event
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    category: 'Conference',
    status: 'Draft',
    registrationDeadline: '',
    price: '',
    organizer: '',
    image: null
  })

  const handleLogout = () => {
    router.push('/')
  }

  const handleAddEvent = (e) => {
    e.preventDefault()
    const newEvent = {
      id: events.length + 1,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      maxParticipants: parseInt(formData.maxParticipants),
      currentParticipants: 0,
      category: formData.category,
      status: formData.status,
      organizer: formData.organizer,
      price: formData.price,
      registrationDeadline: formData.registrationDeadline,
      image: formData.image || '/api/placeholder/300/200',
      tags: []
    }
    setEvents([...events, newEvent])
    setShowAddModal(false)
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      maxParticipants: '',
      category: 'Conference',
      status: 'Draft',
      registrationDeadline: '',
      price: '',
      organizer: '',
      image: null
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
        image: URL.createObjectURL(file)
      })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, active: false, href: '/Dashboard' },
    { name: 'Member Management', icon: Users, active: false, href: '/members' },
    { name: 'Event Management', icon: CalendarIcon, active: true, href: '/events' },
    { name: 'Forum', icon: MessageSquare, active: false, href: '/forum' },
    { name: 'System Settings', icon: Settings, active: false, href: '/settings' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800'
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Conference':
        return 'bg-blue-100 text-blue-800'
      case 'Workshop':
        return 'bg-purple-100 text-purple-800'
      case 'Seminar':
        return 'bg-orange-100 text-orange-800'
      case 'Bootcamp':
        return 'bg-pink-100 text-pink-800'
      case 'Career Fair':
        return 'bg-green-100 text-green-800'
      case 'Summit':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white">
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
          {sidebarItems.map((item, index) => (
            <div key={item.name}>
              <button
                onClick={() => item.href && router.push(item.href)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-slate-700 transition-colors ${
                  item.active ? 'bg-blue-600 border-r-2 border-blue-400' : ''
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
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-800">Event Management</h1>
              <div className="flex items-center space-x-2">
                <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Event</span>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="bg-white px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-200 rounded-lg">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Categories</option>
                <option>Conference</option>
                <option>Workshop</option>
                <option>Seminar</option>
                <option>Bootcamp</option>
                <option>Career Fair</option>
                <option>Summit</option>
              </select>
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Published</option>
                <option>Draft</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <div className="flex border border-gray-200 rounded-lg">
                <button 
                  onClick={() => setView('grid')}
                  className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Grid
                </button>
                <button 
                  onClick={() => setView('list')}
                  className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <CalendarIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.date)} • {event.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm">
                        <span className="font-medium text-green-600">{event.price}</span>
                        <span className="text-gray-500 ml-2">by {event.organizer}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Event</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Date & Time</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Location</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Participants</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                                {event.category}
                              </span>
                              <span className="text-xs text-gray-500">by {event.organizer}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(event.date)}<br />
                          <span className="text-xs text-gray-500">{event.time}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{event.location}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {event.currentParticipants}/{event.maxParticipants}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Create Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg transform transition-all duration-300 scale-100 hover:scale-[1.01] overflow-y-auto max-h-[90vh]">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleAddEvent} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Image</label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      {formData.image ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-20 h-20 rounded-md object-cover mb-3 border border-gray-200"
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
                        name="image"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="mt-3 inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
                      >
                        Select Image
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Max Participants</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                      >
                        <option value="Conference">Conference</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Bootcamp">Bootcamp</option>
                        <option value="Career Fair">Career Fair</option>
                        <option value="Summit">Summit</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Deadline</label>
                      <input
                        type="date"
                        name="registrationDeadline"
                        value={formData.registrationDeadline}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g., Free, Rp 100.000"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organizer</label>
                    <input
                      type="text"
                      name="organizer"
                      value={formData.organizer}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
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
                      Create Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}