'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  Check,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Home,
  Users,
  Bell,
  User,
  Search,
  Tv,
  X,
  Send,
  Copy,
  ChevronDown,
  ChevronUp,
  Download,
  Flame,
  Globe
} from 'lucide-react';

// ============================================================================
// 1. BACKEND-READY DATA STRUCTURE (Replace with Firebase Firestore / Storage)
// ============================================================================

// Fake demo data array - Later replace with Firebase fetch (e.g. getDocs(collection(db, "videos")))
const INITIAL_VIDEOS = [
  {
    id: 'vid-1',
    url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    username: 'bunny_adventures',
    displayName: 'Big Buck Official',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    caption: 'Spring morning waking up in high resolution! 🐰✨ Wait for the jump! #cliptok #nature #bunny #classic #fyp',
    song: 'Original Sound - @bunny_adventures • Morning Breeze',
    likes: 124800,
    comments: 3420,
    bookmarks: 8910,
    shares: 4120,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    verified: true,
  },
  {
    id: 'vid-2',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    username: 'chromecast_vibes',
    displayName: 'Cinematic Flow',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    caption: 'Chasing golden hour blaze and sunset vibes 🔥 Drop your city in the comments! #cliptok #cinematic #film #aesthetic',
    song: 'Golden Hour Beat - @cinematicflow • Chill Sunset',
    likes: 89340,
    comments: 1840,
    bookmarks: 5410,
    shares: 2310,
    isLiked: true,
    isSaved: false,
    isFollowing: true,
    verified: false,
  },
  {
    id: 'vid-3',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    username: 'travel_escape',
    displayName: 'Wanderlust Escapes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    caption: 'Escaping into ocean paradise 🌊 Tag who you would swim here with right now! #cliptok #travel #wanderlust #ocean',
    song: 'Tropical Deep House - @travel_escape • Island Remix',
    likes: 245100,
    comments: 9120,
    bookmarks: 31200,
    shares: 15400,
    isLiked: false,
    isSaved: true,
    isFollowing: false,
    verified: true,
  },
  {
    id: 'vid-4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    username: 'urban_skater',
    displayName: 'Urban Moves & Fun',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    caption: 'Attempt #47 finally landed the kickflip clean! Never quit the grind 🛹⚡ #skate #lifestyle #challenge #fun',
    song: 'Phonk Kick - @urban_skater • High BPM Anthem',
    likes: 67200,
    comments: 890,
    bookmarks: 2400,
    shares: 980,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    verified: false,
  },
  {
    id: 'vid-5',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    username: 'festival_beats',
    displayName: 'Festival Culture',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    caption: 'The crowd reaction right when the bass dropped! Pure euphoria 🎆 Tag your festival squad! #edm #festival #lights',
    song: 'Euphoric Drop 2026 - @festival_beats • Live Stage',
    likes: 312500,
    comments: 11400,
    bookmarks: 48900,
    shares: 29800,
    isLiked: true,
    isSaved: true,
    isFollowing: true,
    verified: true,
  },
];

// Helper to format numbers in TikTok style (e.g. 124.8K, 1.2M)
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// ============================================================================
// 2. MAIN COMPONENT (Next.js 14 App Router Page - ClipTok)
// ============================================================================

export default function ClipTokApp() {
  const [videos, setVideos] = useState(INITIAL_VIDEOS);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'friends' | 'upload' | 'inbox' | 'profile'
  const [feedFilter, setFeedFilter] = useState('foryou'); // 'following' | 'foryou'
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // default muted for browser autoplay policies
  
  // Modals state
  const [activeCommentsVideoId, setActiveCommentsVideoId] = useState(null);
  const [activeShareVideo, setActiveShareVideo] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Floating heart burst animations for double tap
  const [heartBursts, setHeartBursts] = useState([]);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const containerRef = useRef(null);

  // Initialize PWA installation listeners
  useEffect(() => {
    // TODO: Add Firebase Analytics / performance monitoring here later
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsPWAInstalled(isStandalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('To install ClipTok, tap "Share" on iOS Safari and choose "Add to Home Screen", or use browser install button.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  // Keyboard navigation up / down
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeCommentsVideoId || activeShareVideo || isUploadOpen) return;
      if (e.key === 'ArrowDown') {
        scrollToVideo(Math.min(videos.length - 1, activeVideoIndex + 1));
      } else if (e.key === 'ArrowUp') {
        scrollToVideo(Math.max(0, activeVideoIndex - 1));
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideoIndex, videos.length, activeCommentsVideoId, activeShareVideo, isUploadOpen]);

  // Scroll snap observer to track currently centered video
  const handleScroll = (e) => {
    const container = e.target;
    const height = container.clientHeight;
    if (height === 0) return;
    const index = Math.round(container.scrollTop / height);
    if (index !== activeVideoIndex && index >= 0 && index < videos.length) {
      setActiveVideoIndex(index);
    }
  };

  const scrollToVideo = (index) => {
    if (!containerRef.current) return;
    const height = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * height,
      behavior: 'smooth',
    });
    setActiveVideoIndex(index);
  };

  // ============================================================================
  // 3. BACKEND-READY ACTION HANDLERS (With Firebase comments)
  // ============================================================================

  // Like video handler
  const handleLike = (id) => {
    // TODO: Add Firebase here later (e.g. updateDoc(doc(db, "videos", id), { likes: increment(1) }))
    setVideos((prev) =>
      prev.map((video) => {
        if (video.id === id) {
          const isLiked = !video.isLiked;
          return {
            ...video,
            isLiked,
            likes: isLiked ? video.likes + 1 : video.likes - 1,
          };
        }
        return video;
      })
    );
  };

  // Double tap video trigger (bursts heart and likes)
  const handleDoubleTap = (id, clientX, clientY) => {
    // TODO: Add Firebase here later
    const newBurst = {
      id: Date.now() + Math.random(),
      x: clientX || window.innerWidth / 2,
      y: clientY || window.innerHeight / 2,
    };
    setHeartBursts((prev) => [...prev, newBurst]);
    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
    }, 900);

    // Auto-like if not already liked
    setVideos((prev) =>
      prev.map((video) => {
        if (video.id === id && !video.isLiked) {
          return {
            ...video,
            isLiked: true,
            likes: video.likes + 1,
          };
        }
        return video;
      })
    );
  };

  // Bookmark / Save handler
  const handleBookmark = (id) => {
    // TODO: Add Firebase here later (e.g. setDoc(doc(db, "users", userId, "bookmarks", id), ...))
    setVideos((prev) =>
      prev.map((video) => {
        if (video.id === id) {
          const isSaved = !video.isSaved;
          return {
            ...video,
            isSaved,
            bookmarks: isSaved ? video.bookmarks + 1 : video.bookmarks - 1,
          };
        }
        return video;
      })
    );
  };

  // Follow / Unfollow user handler
  const handleFollow = (username) => {
    // TODO: Add Firebase here later (e.g. updateDoc / arrayUnion in user following list)
    setVideos((prev) =>
      prev.map((video) => {
        if (video.username === username) {
          return {
            ...video,
            isFollowing: !video.isFollowing,
          };
        }
        return video;
      })
    );
  };

  // Share handler
  const handleShare = (video) => {
    // TODO: Add Firebase here later (track share analytics in Firestore)
    setActiveShareVideo(video);
  };

  // Add Comment handler
  const handleAddComment = (videoId, text) => {
    // TODO: Add Firebase here later (e.g. addDoc(collection(db, "videos", videoId, "comments"), ...))
    setVideos((prev) =>
      prev.map((video) => {
        if (video.id === videoId) {
          return {
            ...video,
            comments: video.comments + 1,
          };
        }
        return video;
      })
    );
  };

  // Upload video handler
  const handleUploadVideo = (newVideo) => {
    // TODO: Add Firebase here later (e.g. uploadBytes(storageRef, file) and addDoc(collection(db, "videos"), ...))
    const createdVideo = {
      id: `vid-${Date.now()}`,
      url: newVideo.url || 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      username: 'you',
      displayName: 'My Profile',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      caption: newVideo.caption || 'New uploaded clip on #cliptok! 🔥 #trending #viral',
      song: newVideo.song || 'Original Sound - @you',
      likes: 1,
      comments: 0,
      bookmarks: 0,
      shares: 0,
      isLiked: true,
      isSaved: false,
      isFollowing: false,
      verified: false,
    };
    setVideos((prev) => [createdVideo, ...prev]);
    setIsUploadOpen(false);
    setActiveTab('home');
    scrollToVideo(0);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#010101] text-white overflow-hidden flex flex-col justify-between select-none">
      
      {/* Top Header Navigation Overlay */}
      {activeTab === 'home' && (
        <TopNav
          feedFilter={feedFilter}
          setFeedFilter={setFeedFilter}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          onSearchClick={() => setIsSearching(true)}
          showInstallBanner={showInstallBanner && !isPWAInstalled}
          onInstallClick={handleInstallPWA}
        />
      )}

      {/* Main Content View Switcher */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {activeTab === 'home' && (
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
            style={{ scrollBehavior: 'smooth' }}
          >
            {videos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={index === activeVideoIndex}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                onLike={() => handleLike(video.id)}
                onDoubleTap={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleDoubleTap(video.id, e.clientX || rect.left + rect.width / 2, e.clientY || rect.top + rect.height / 2);
                }}
                onBookmark={() => handleBookmark(video.id)}
                onComment={() => setActiveCommentsVideoId(video.id)}
                onShare={() => handleShare(video)}
                onFollow={() => handleFollow(video.username)}
              />
            ))}

            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex flex-col gap-2 fixed right-6 top-1/2 -translate-y-1/2 z-30">
              <button
                onClick={() => scrollToVideo(Math.max(0, activeVideoIndex - 1))}
                disabled={activeVideoIndex === 0}
                className="p-3 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md transition disabled:opacity-30 disabled:cursor-not-allowed text-white"
                title="Previous video"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToVideo(Math.min(videos.length - 1, activeVideoIndex + 1))}
                disabled={activeVideoIndex === videos.length - 1}
                className="p-3 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md transition disabled:opacity-30 disabled:cursor-not-allowed text-white"
                title="Next video"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'friends' && <FriendsView videos={videos} onVideoSelect={(idx) => { setActiveTab('home'); scrollToVideo(idx); }} />}
        {activeTab === 'inbox' && <InboxView />}
        {activeTab === 'profile' && <ProfileView videos={videos} />}
      </div>

      {/* Floating Double Tap Heart Bursts */}
      {heartBursts.map((heart) => (
        <div
          key={heart.id}
          className="pointer-events-none fixed z-50 animate-heart-burst"
          style={{
            left: `${heart.x - 45}px`,
            top: `${heart.y - 45}px`,
          }}
        >
          <Heart className="w-24 h-24 fill-[#FE2C55] text-[#FE2C55] drop-shadow-[0_0_16px_rgba(254,44,85,0.8)]" />
        </div>
      ))}

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      {/* Interactive Sliding Comments Drawer */}
      {activeCommentsVideoId && (
        <CommentsDrawer
          video={videos.find((v) => v.id === activeCommentsVideoId)}
          onClose={() => setActiveCommentsVideoId(null)}
          onAddComment={(text) => handleAddComment(activeCommentsVideoId, text)}
        />
      )}

      {/* Interactive Share Sheet Drawer */}
      {activeShareVideo && (
        <ShareDrawer
          video={activeShareVideo}
          onClose={() => setActiveShareVideo(null)}
        />
      )}

      {/* Upload Video Modal */}
      {isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUpload={handleUploadVideo}
        />
      )}

      {/* Search Overlay */}
      {isSearching && (
        <SearchOverlay
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClose={() => setIsSearching(false)}
          videos={videos}
          onSelectVideo={(idx) => {
            setIsSearching(false);
            setActiveTab('home');
            scrollToVideo(idx);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// 4. VIDEO CARD COMPONENT
// ============================================================================

function VideoCard({
  video,
  isActive,
  isMuted,
  setIsMuted,
  onLike,
  onDoubleTap,
  onBookmark,
  onComment,
  onShare,
  onFollow,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [loadError, setLoadError] = useState(false);

  // Play / pause when video becomes active
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  // Handle single tap (play/pause) vs double tap (like)
  const handleVideoTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      // Double tap triggered
      onDoubleTap(e);
      setLastTapTime(0);
    } else {
      setLastTapTime(now);
      setTimeout(() => {
        if (Date.now() - now >= DOUBLE_TAP_DELAY) {
          togglePlayPause();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 800);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 800);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] snap-start snap-always overflow-hidden bg-[#010101] flex items-center justify-center">
      {/* Background Ambience Glow */}
      <div className="absolute inset-0 bg-[#010101]" />

      {/* Video Element Wrapper */}
      <div
        className="relative w-full h-full max-w-[500px] mx-auto flex items-center justify-center cursor-pointer select-none"
        onClick={handleVideoTap}
      >
        <video
          ref={videoRef}
          src={video.url}
          loop
          playsInline
          muted={isMuted}
          preload="metadata"
          onError={() => setLoadError(true)}
          className="w-full h-full object-cover"
        />

        {/* Fallback if external video encounters network error */}
        {loadError 
