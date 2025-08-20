'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  LogOut, 
  Download, 
  Plus, 
  Search, 
  ChevronDown, 
  Home, 
  Users, 
  MessageSquare, 
  Calendar,
  Settings,
  X,
  Upload
} from 'lucide-react'

export default function MembersPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [membersData, setMembersData] = useState([])
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
      id: membersData.length + 1,
      name: formData.nama,
      nra: formData.nomorAnggota,
      angkatan: '',
      jurusan: '',
      email: formData.email,
      tinggal: '',
      avatar: formData.nama.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(),
      photo: formData.photo,
      alamat: formData.alamat,
      nomorTelepon: formData.nomorTelepon
    }
    setMembersData([...membersData, newMember])
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
    { name: 'Dashboard', icon: Home, active: false, href: '/Dashboard' },
    { name: 'Member Management', icon: Users, active: true, href: '/members' },
    { name: 'Event Management', icon: Calendar, active: false, href: '/events' },
    { name: 'Forum', icon: MessageSquare, active: false, href: '/forum' },
    { name: 'System Settings', icon: Settings, active: false, href: '/settings' }
  ]

  const getAvatarColor = (index) => {
    const colors = [
      'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'
    ]
    return colors[index % colors.length]
  }

  const filteredMembers = membersData.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
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

        {/* Search and Filter */}
        <div className="bg-white px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <span className="text-sm">Add filter</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a member by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="flex-1 flex">
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">NRA</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Angkatan</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Jurusan</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Email address</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Tinggal</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr 
                    key={member.id}
                    className={`border-b hover:bg-gray-50 cursor-pointer ${
                      selectedMemberId === member.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedMemberId(member.id)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(index)}`}>
                          {member.avatar}
                        </div>
                        <span className="text-sm text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{member.nra}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{member.angkatan}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{member.jurusan}</td>
                    <td className="py-4 px-6 text-sm text-blue-600">{member.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{member.tinggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Member Details Sidebar */}
          {selectedMemberId && (
            <div className="w-80 bg-white border-l p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Member Details</h2>
                <button
                  onClick={() => setSelectedMemberId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filteredMembers.find(member => member.id === selectedMemberId) && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    {filteredMembers.find(member => member.id === selectedMemberId).photo ? (
                      <img
                        src={filteredMembers.find(member => member.id === selectedMemberId).photo}
                        alt="Member photo"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-medium ${getAvatarColor(selectedMemberId - 1)}`}>
                        {filteredMembers.find(member => member.id === selectedMemberId).avatar}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Nama</h3>
                    <p className="text-gray-800">{filteredMembers.find(member => member.id === selectedMemberId).name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Email</h3>
                    <p className="text-gray-800">{filteredMembers.find(member => member.id === selectedMemberId).email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Nomor Anggota</h3>
                    <p className="text-gray-800">{filteredMembers.find(member => member.id === selectedMemberId).nra}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Alamat</h3>
                    <p className="text-gray-800">{filteredMembers.find(member => member.id === selectedMemberId).alamat || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Nomor Telepon</h3>
                    <p className="text-gray-800">{filteredMembers.find(member => member.id === selectedMemberId).nomorTelepon || 'N/A'}</p>
                  </div>
                </div>
              )}
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
  )
}