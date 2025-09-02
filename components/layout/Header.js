"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  User,
  ChevronDown,
  UserIcon,
  Settings,
  Bell,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import ProfileModal from "../members/ProfileModal";
import config from "../../config";

export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    acceptStatusChange,
    rejectStatusChange,
    fetchNotifications,
    fetchUnreadCount,
    loading,
  } = useNotifications();

  // Debug logging
  useEffect(() => {
    console.log("Header - Notifications:", notifications);
    console.log("Header - Unread count:", unreadCount);
    console.log("Header - Loading:", loading);
    console.log("Header - User:", user);
  }, [notifications, unreadCount, loading, user]);

  // Force fetch notifications when user data is available
  useEffect(() => {
    if (user && user.id && notifications.length === 0 && !loading) {
      console.log("🔄 User loaded but no notifications, fetching...");
      fetchNotifications();
    }
  }, [user, notifications.length, loading]);

  const getStatusLabel = (status) => {
    const statusMap = {
      anggota: "Anggota",
      bph: "BPH",
      alb: "ALB",
      dpo: "DPO",
      bp: "BP",
    };
    return statusMap[status] || status;
  };

  const getUserInitials = (nama) => {
    if (!nama || nama === "N/A") return "U";
    return nama
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getUserPhotoUrl = (foto) => {
    if (!foto || foto === "N/A" || foto === "Foto") return null;
    if (foto.startsWith("http")) return foto + "?t=" + Date.now();
    if (foto.startsWith("/uploads/") || foto.includes("uploads/")) {
      const fileName = foto.replace("/uploads/", "").replace("uploads/", "");
      return config.endpoints.uploads(fileName) + "?t=" + Date.now();
    }
    return config.endpoints.uploads(foto) + "?t=" + Date.now();
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      logout();
    }
    setShowDropdown(false);
  };

  const handleAcceptStatusChange = async (notificationId) => {
    try {
      console.log("🟢 Accepting notification:", notificationId);
      await acceptStatusChange(notificationId);
      console.log("✅ Notification accepted successfully");
    } catch (error) {
      console.error("💥 Failed to accept status change:", error);
      alert("Gagal menerima notifikasi. Silakan coba lagi.");
    }
  };

  const handleRejectStatusChange = async (notificationId) => {
    try {
      console.log("🔴 Rejecting notification:", notificationId);
      await rejectStatusChange(notificationId);
      console.log("✅ Notification rejected successfully");
    } catch (error) {
      console.error("💥 Failed to reject status change:", error);
      alert("Gagal menolak notifikasi. Silakan coba lagi.");
    }
  };

  const handleRefreshNotifications = async () => {
    try {
      console.log("🔄 Refreshing notifications...");
      await fetchNotifications();
      await fetchUnreadCount();
      console.log("✅ Notifications refreshed");
    } catch (error) {
      console.error("💥 Failed to refresh notifications:", error);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".notification-dropdown")) {
        setShowNotifications(false);
      }
      if (!event.target.closest(".user-dropdown")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 shadow-sm lg:ml-0">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-6">
          {/* Hamburger button - clean design */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold text-gray-900">
              Sistem Manajemen Anggota
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Computer Club Oriented Network Utility And Technology
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell - Clean Design */}
          <div className="relative notification-dropdown">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifikasi
                      </h3>
                      {unreadCount > 0 && (
                        <p className="text-sm text-gray-500">
                          {unreadCount} notifikasi belum dibaca
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleRefreshNotifications}
                      className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                      title="Refresh notifikasi"
                    >
                      <RefreshCw
                        className={`w-4 h-4 text-gray-500 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {loading && notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-sm text-blue-500">
                        Memuat notifikasi...
                      </span>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-base font-medium text-gray-900 mb-1">
                      Tidak ada notifikasi
                    </p>
                    <p className="text-sm text-gray-500">
                      Semua notifikasi akan muncul di sini
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id_notification}
                        className={`px-4 py-3 border-b border-gray-50 ${
                          !notification.read_at ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {/* Icon berbeda berdasarkan jenis notifikasi */}
                              {notification.pending === 1 ? (
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-blue-500" />
                              )}
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title ||
                                  (notification.pending === 1
                                    ? "Konfirmasi Perubahan Status"
                                    : "Pemberitahuan Perubahan Status")}
                              </h4>
                              {/* Badge untuk jenis notifikasi */}
                              {notification.pending === 1 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                  Perlu Konfirmasi
                                </span>
                              ) : notification.pending === 0 &&
                                notification.accepted === 1 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  <Check className="w-3 h-3 mr-1" />
                                  Diterima
                                </span>
                              ) : notification.pending === 0 &&
                                notification.accepted === 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  <X className="w-3 h-3 mr-1" />
                                  Ditolak
                                </span>
                              ) : null}
                              {!notification.read_at && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message ||
                                (notification.pending === 1
                                  ? notification.from_member_name
                                    ? `${notification.from_member_name} meminta perubahan status anggota`
                                    : "Permintaan perubahan status anggota"
                                  : notification.from_member_name
                                  ? `${notification.from_member_name} telah mengubah status anggota`
                                  : "Status anggota telah diubah")}
                            </p>

                            {/* Show metadata info if available */}
                            {notification.metadata && (
                              <p className="text-xs text-gray-500 mt-1">
                                {(() => {
                                  try {
                                    const meta = JSON.parse(
                                      notification.metadata
                                    );
                                    return `Status: ${
                                      meta.status_from || "Unknown"
                                    } → ${meta.status_to || "Unknown"}`;
                                  } catch {
                                    return "";
                                  }
                                })()}
                              </p>
                            )}

                            {/* Pesan tambahan untuk notifikasi yang sudah diterima */}
                            {notification.pending === 0 &&
                              notification.accepted === 1 && (
                                <p className="text-xs text-green-600 mt-1 font-medium">
                                  ✓ Status telah diperbarui
                                </p>
                              )}
                            <p className="text-xs text-gray-400 mt-1">
                              Dari:{" "}
                              {notification.from_member_name ||
                                notification.from_member}{" "}
                              • Target:{" "}
                              {notification.target_member_name ||
                                notification.target_member}{" "}
                              •
                              {new Date(notification.created_at).toLocaleString(
                                "id-ID"
                              )}
                            </p>

                            {/* Tampilkan tombol Accept/Reject jika pending */}
                            {notification.pending === 1 && (
                              <div className="flex items-center space-x-2 mt-3">
                                <button
                                  onClick={() =>
                                    handleAcceptStatusChange(
                                      notification.id_notification
                                    )
                                  }
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Terima
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectStatusChange(
                                      notification.id_notification
                                    )
                                  }
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Tolak
                                </button>
                              </div>
                            )}

                            {/* Tampilkan status jika sudah diproses */}
                            {notification.pending === 0 && (
                              <div className="mt-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    notification.accepted === 1
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {notification.accepted === 1 ? (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      Diterima
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 mr-1" />
                                      Ditolak
                                    </>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile - Clean Design */}
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center overflow-hidden">
              {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : getUserPhotoUrl(user?.foto) ? (
                <img
                  src={getUserPhotoUrl(user?.foto)}
                  alt={`Foto ${user?.nama}`}
                  className="w-8 h-8 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-bold ${
                  getUserPhotoUrl(user?.foto) ? "hidden" : "flex"
                }`}
              >
                {getUserInitials(user?.nama)}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 truncate max-w-32">
                {isLoading ? "..." : user?.nama || "User"}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {isLoading ? "..." : getStatusLabel(user?.status_keanggotaan)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          member={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </header>
  );
}
