"use client";
import { useEffect, useState, useRef } from "react";
import useSWR, { mutate } from "swr";
import { API_URL } from "./config";

// --- 1. ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU (TYPES) ---
interface Artist {
  id: string;
  name: string;
  pictureUrl: string | null;
}

interface Album {
  id: string;
  title: string;
  year: number;
  coverUrl: string;
}

interface Track {
  id: string;
  title: string;
  fileName: string;
  duration: number;
  streamUrl: string;
}

// Hàm fetcher chuẩn cho SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  // --- 2. QUẢN LÝ TRẠNG THÁI UI (VIEW STATE) ---
  // Lưu ý: Chúng ta không cần useState cho data (artists, albums...) nữa vì SWR sẽ lo việc đó.
  const [view, setView] = useState<"artists" | "albums" | "tracks">("artists");

  // Dữ liệu đang chọn (để làm tham số cho API kế tiếp)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Trình phát nhạc
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- 3. SỬ DỤNG SWR (DATA FETCHING) ---

  // 3.1. Lấy danh sách nghệ sĩ (Luôn fetch khi component mount)
  // Key là URL API. Khi key không null, SWR sẽ gọi fetcher.
  const { data: artists, error: artistsError } = useSWR<Artist[]>(
    `${API_URL}/music/artists`,
    fetcher,
    {
      revalidateOnFocus: false, // Tùy chọn: Không fetch lại khi tab được focus (để giảm request)
    }
  );

  // 3.2. Lấy Albums (Conditional Fetching)
  // Chỉ fetch khi selectedArtist có giá trị (khác null). Nếu null, SWR sẽ tạm dừng.
  const { data: albums } = useSWR<Album[]>(
    selectedArtist
      ? `${API_URL}/music/artist/${selectedArtist.id}/albums`
      : null,
    fetcher
  );

  // 3.3. Lấy Tracks (Conditional Fetching)
  // Chỉ fetch khi selectedAlbum có giá trị.
  const { data: tracks } = useSWR<Track[]>(
    selectedAlbum ? `${API_URL}/music/album/${selectedAlbum.id}/tracks` : null,
    fetcher
  );

  // --- 4. CÁC HÀM XỬ LÝ SỰ KIỆN (EVENT HANDLERS) ---

  // Khi chọn Artist -> Chỉ cần set state, SWR sẽ tự động fetch albums
  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setView("albums");
  };

  // Khi chọn Album -> Chỉ cần set state, SWR sẽ tự động fetch tracks
  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setView("tracks");
  };

  const handleRescan = async () => {
    try {
      await fetch(`${API_URL}/music/scan`);
      // Sau khi scan xong, báo cho SWR biết dữ liệu artists đã cũ, cần fetch lại
      mutate(`${API_URL}/music/artists`);
      alert("Scan hoàn tất!");
    } catch (error) {
      console.error("Lỗi scan:", error);
    }
  };

  // --- 5. XỬ LÝ PHÁT NHẠC (GIỮ NGUYÊN) ---
  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.load();
      audioRef.current.play().catch((e) => console.log("Chặn auto-play:", e));
    }
  }, [currentTrack]);

  const handleBack = () => {
    if (view === "tracks") {
      setView("albums");
      setSelectedAlbum(null); // Reset chọn album để ngừng fetch tracks (nếu muốn)
    } else if (view === "albums") {
      setView("artists");
      setSelectedArtist(null); // Reset chọn artist
    }
  };

  // --- 6. GIAO DIỆN (UI) ---
  // Xử lý loading state đơn giản
  if (!artists && !artistsError)
    return <div className="p-10 text-white">Đang tải thư viện...</div>;

  return (
    <main className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {/* HEADER */}
      <header className="p-4 bg-gray-800 shadow-md flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          {view !== "artists" && (
            <button
              onClick={handleBack}
              className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            >
              ← Quay lại
            </button>
          )}
          <h1 className="text-xl font-bold text-green-400">Music Manager</h1>
        </div>
        <button
          onClick={handleRescan}
          className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-500"
        >
          Rescan Library
        </button>
      </header>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {/* VIEW: ARTISTS */}
        {view === "artists" && artists && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {artists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => handleSelectArtist(artist)}
                className="cursor-pointer group hover:bg-gray-800 p-4 rounded-lg transition"
              >
                <div className="aspect-square bg-gray-700 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-green-500">
                  {artist.pictureUrl ? (
                    <img
                      src={artist.pictureUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🎤
                    </div>
                  )}
                </div>
                <h3 className="text-center font-medium truncate">
                  {artist.name}
                </h3>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: ALBUMS */}
        {view === "albums" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-gray-400">Nghệ sĩ:</span>{" "}
              {selectedArtist?.name}
            </h2>
            {!albums ? (
              <p>Đang tải albums...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => handleSelectAlbum(album)}
                    className="cursor-pointer group hover:bg-gray-800 p-4 rounded-lg transition"
                  >
                    <div className="aspect-square bg-gray-700 rounded mb-3 shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
                      {album.coverUrl ? (
                        <img
                          src={album.coverUrl}
                          alt={album.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          💿
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold truncate">{album.title}</h3>
                    <p className="text-sm text-gray-400">{album.year}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: TRACKS */}
        {view === "tracks" && (
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-6 mb-8 items-end">
              <div className="w-48 h-48 bg-gray-700 shadow-2xl rounded-lg overflow-hidden">
                {selectedAlbum?.coverUrl && (
                  <img
                    src={selectedAlbum.coverUrl}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-2">
                  {selectedAlbum?.title}
                </h2>
                <p className="text-xl text-gray-300">
                  {selectedArtist?.name} • {selectedAlbum?.year}
                </p>
              </div>
            </div>

            {!tracks ? (
              <p>Đang tải bài hát...</p>
            ) : (
              <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                {tracks.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`p-4 flex items-center justify-between border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${
                      currentTrack?.id === track.id
                        ? "text-green-400 bg-gray-700"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 w-6 text-right">
                        {index + 1}
                      </span>
                      <span className="font-medium">{track.title}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {Math.floor(track.duration / 60)}:
                      {(track.duration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER PLAYER (GIỮ NGUYÊN) */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-linear-to-t from-black to-gray-900 border-t border-gray-800 flex items-center px-6 z-50">
          <div className="w-1/3 flex items-center gap-4">
            {selectedAlbum?.coverUrl && (
              <img
                src={selectedAlbum.coverUrl}
                className="h-14 w-14 rounded shadow-md object-cover"
              />
            )}
            <div className="truncate">
              <div className="font-bold text-white truncate">
                {currentTrack.title}
              </div>
              <div className="text-xs text-gray-400">
                {selectedArtist?.name}
              </div>
            </div>
          </div>
          <div className="w-1/3 flex justify-center">
            <audio
              ref={audioRef}
              controls
              className="w-full max-w-md h-10 invert opacity-80 hover:opacity-100 transition-opacity"
              src={currentTrack.streamUrl}
            />
          </div>
          <div className="w-1/3 text-right text-xs text-gray-500">
            FLAC Streaming
          </div>
        </div>
      )}
    </main>
  );
}
