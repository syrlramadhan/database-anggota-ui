'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  LogOut, 
  Plus, 
  Search, 
  Filter,
  Home, 
  Users, 
  MessageSquare, 
  Calendar,
  Settings,
  MoreHorizontal,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  Eye,
  ThumbsUp,
  Pin,
  TrendingUp,
  Clock,
  User
} from 'lucide-react'

export default function ForumsPage() {
  const [activeTab, setActiveTab] = useState('All Posts')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, active: false, href: '/Dashboard' },
    { name: 'Member Management', icon: Users, active: false, href: '/members' },
    { name: 'Event Management', icon: Calendar, active: false, href: '/events' },
    { name: 'Forum', icon: MessageSquare, active: true, href: '/forum' },
    { name: 'System Settings', icon: Settings, active: false, href: '/settings' }
  ]

  const forumTabs = [
    { name: 'All Posts', active: true },
    { name: 'Trending', active: false },
    { name: 'Events', active: false },
    { name: 'Discussions', active: false },
    { name: 'Announcements', active: false }
  ]

  const forumPosts = [
    {
      id: 1,
      type: 'Event',
      title: 'EVENT IDSECCONF 2025',
      description: 'Selamat datang ke hari pertama registration Event conference IDSECCONF di Indonesia. Event ini akan membahas berbagai topik terkini dalam cybersecurity dan teknologi informasi.',
      author: 'Syarif Rahman',
      authorAvatar: 'SR',
      timeAgo: '2 hours ago',
      category: 'Conference',
      isPinned: true,
      stats: {
        views: 245,
        likes: 32,
        comments: 15,
        shares: 8
      },
      tags: ['Cybersecurity', 'Conference', 'Technology']
    },
    {
      id: 2,
      type: 'Discussion',
      title: 'Tips Keamanan Siber untuk Pemula',
      description: 'Mari berbagi tips dan trik keamanan siber yang mudah dipahami untuk pemula. Apa saja yang perlu diperhatikan saat browsing internet?',
      author: 'Obo Wibowo',
      authorAvatar: 'OW',
      timeAgo: '4 hours ago',
      category: 'Security',
      isPinned: false,
      stats: {
        views: 156,
        likes: 28,
        comments: 23,
        shares: 5
      },
      tags: ['Security', 'Tips', 'Beginner']
    },
    {
      id: 3,
      type: 'Announcement',
      title: 'Update Platform DBANGGOTA v2.1',
      description: 'Platform telah diperbarui dengan fitur-fitur baru termasuk sistem notifikasi real-time, dashboard yang lebih responsif, dan peningkatan keamanan.',
      author: 'Admin Team',
      authorAvatar: 'AT',
      timeAgo: '6 hours ago',
      category: 'Updates',
      isPinned: true,
      stats: {
        views: 389,
        likes: 45,
        comments: 12,
        shares: 15
      },
      tags: ['Update', 'Platform', 'Features']
    },
    {
      id: 4,
      type: 'Discussion',
      title: 'Pengalaman Magang di Perusahaan Tech',
      description: 'Berbagi pengalaman magang di berbagai perusahaan teknologi. Apa saja yang dipelajari dan tips untuk mendapatkan magang impian?',
      author: 'Jane Cooper',
      authorAvatar: 'JC',
      timeAgo: '8 hours ago',
      category: 'Career',
      isPinned: false,
      stats: {
        views: 198,
        likes: 22,
        comments: 31,
        shares: 7
      },
      tags: ['Career', 'Internship', 'Experience']
    },
    {
      id: 5,
      type: 'Event',
      title: 'Webinar: Future of AI in Indonesia',
      description: 'Join us for an exciting webinar about the future of Artificial Intelligence in Indonesia. Expert speakers will discuss trends, opportunities, and challenges.',
      author: 'Cody Fisher',
      authorAvatar: 'CF',
      timeAgo: '12 hours ago',
      category: 'Webinar',
      isPinned: false,
      stats: {
        views: 312,
        likes: 38,
        comments: 19,
        shares: 12
      },
      tags: ['AI', 'Webinar', 'Technology']
    },
    {
      id: 6,
      type: 'Discussion',
      title: 'Study Group Web Development',
      description: 'Mencari teman untuk belajar web development bersama. Kita bisa sharing knowledge dan mengerjakan project bersama-sama.',
      author: 'Marvin McKinney',
      authorAvatar: 'MM',
      timeAgo: '1 day ago',
      category: 'Study Group',
      isPinned: false,
      stats: {
        views: 167,
        likes: 19,
        comments: 27,
        shares: 4
      },
      tags: ['Study', 'Web Development', 'Collaboration']
    }
  ]

  const getTypeColor = (type) => {
    switch (type) {
      case 'Event':
        return 'bg-orange-100 text-orange-600'
      case 'Discussion':
        return 'bg-blue-100 text-blue-600'
      case 'Announcement':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getAvatarColor = (index) => {
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white">
        {/* Profile Section */}
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

        {/* Navigation */}
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
              <h1 className="text-xl font-semibold text-gray-800">Forum Community</h1>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors">
                <Plus className="w-4 h-4" />
                <span>New Post</span>
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

        {/* Tabs and Search */}
        <div className="bg-white px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              {forumTabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeTab === tab.name
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-200 rounded-lg">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Forum Posts */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {forumPosts.map((post, index) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(index)}`}>
                        {post.authorAvatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{post.author}</h4>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{post.timeAgo}</span>
                          {post.isPinned && (
                            <Pin className="w-4 h-4 text-orange-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}>
                            {post.type}
                          </span>
                          <span className="text-xs text-gray-500">{post.category}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{post.description}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center space-x-2 mb-4">
                    {post.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Post Stats and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.stats.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.stats.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.stats.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4" />
                        <span>{post.stats.shares}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">Like</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Comment</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>
                      <button className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}