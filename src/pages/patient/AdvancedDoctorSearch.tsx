import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Search,
  Star,
  MapPin,
  X,
  Calendar,
  DollarSign,
  SlidersHorizontal,
  List,
  Map,
  Navigation,
  AlertTriangle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDoctorRating, getDoctorReviewStats } from "@/lib/reviews";
import AuthDialog from "@/components/auth/AuthDialog";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const STAFF_STORAGE_KEY = "cliniccare:staff";
const GEOCODE_CACHE_KEY = "cliniccare:geocode_cache";

// Extended Doctor interface with location and price
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  available: boolean;
  price?: number; // Consultation fee in VND
  location?: {
    address: string;
    lat: number;
    lng: number;
    geocoded?: boolean; // Whether this was geocoded successfully
  };
  experienceYears?: number;
  degree?: string;
}

// Geocode cache interface
interface GeocodeCache {
  [address: string]: {
    lat: number;
    lng: number;
    timestamp: number;
  };
}

// Geocode an address using Google Maps Geocoding API
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  // Check cache first
  try {
    const cached = localStorage.getItem(GEOCODE_CACHE_KEY);
    if (cached) {
      const cache: GeocodeCache = JSON.parse(cached);
      const cachedResult = cache[address];
      // Cache valid for 7 days
      if (cachedResult && Date.now() - cachedResult.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return { lat: cachedResult.lat, lng: cachedResult.lng };
      }
    }
  } catch (e) {
    // Ignore cache errors
  }

  // Check if Google Maps is loaded
  if (!window.google?.maps?.Geocoder) {
    return null;
  }

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        const coords = {
          lat: location.lat(),
          lng: location.lng(),
        };

        // Save to cache
        try {
          const cached = localStorage.getItem(GEOCODE_CACHE_KEY);
          const cache: GeocodeCache = cached ? JSON.parse(cached) : {};
          cache[address] = {
            ...coords,
            timestamp: Date.now(),
          };
          // Keep cache size reasonable (max 100 entries)
          const entries = Object.entries(cache);
          if (entries.length > 100) {
            // Remove oldest entries
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toKeep = entries.slice(-100);
            const newCache: GeocodeCache = {};
            toKeep.forEach(([key, value]) => {
              newCache[key] = value;
            });
            localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(newCache));
          } else {
            localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
          }
        } catch (e) {
          // Ignore cache save errors
        }

        resolve(coords);
      } else {
        // Geocoding failed
        console.warn(`Không tìm thấy địa chỉ trên Google Maps: "${address}"`);
        resolve(null);
      }
    });
  });
};

// Load doctors from localStorage
const loadDoctors = (): Doctor[] => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const staff = JSON.parse(stored);
      return staff
        .filter((s: any) => s.role === "doctor" && s.status === "active")
        .map((s: any) => {
          const realRating = getDoctorRating(s.id);
          const stats = getDoctorReviewStats(s.id);
          
          // Default location (Ho Chi Minh City center)
          const defaultLocation = {
            address: s.address || "123 Đường ABC, Quận 1, TP.HCM",
            lat: s.location?.lat || 10.8231 + (Math.random() - 0.5) * 0.1,
            lng: s.location?.lng || 106.6297 + (Math.random() - 0.5) * 0.1,
          };
          
          return {
            id: s.id,
            name: s.fullName,
            specialty: s.specialty || "Nội tổng quát",
            experience: s.experienceYears 
              ? `${s.experienceYears} năm kinh nghiệm` 
              : "Nhiều năm kinh nghiệm",
            rating: realRating > 0 ? realRating : (s.rating || 4.5),
            reviews: stats.totalReviews || Math.floor(Math.random() * 100) + 20,
            available: s.status === "active",
            price: s.price || Math.floor(Math.random() * 300000) + 200000, // 200k - 500k VND
            location: defaultLocation,
            experienceYears: s.experienceYears,
            degree: s.degree,
          };
        });
    }
  } catch {}
  return [];
};

// Get Google Maps API Key from settings or env
const getMapsApiKey = (): string => {
  try {
    const settings = localStorage.getItem("cliniccare:settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.integrations?.mapsApiKey) {
        return parsed.integrations.mapsApiKey;
      }
    }
  } catch {}
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
};

const AdvancedDoctorSearch = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<number[]>([0, 5]);
  const [priceFilter, setPriceFilter] = useState<number[]>([0, 1000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 10.8231, lng: 106.6297 }); // HCMC center
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceFilter, setDistanceFilter] = useState(0); // km
  const [selectedMapDoctor, setSelectedMapDoctor] = useState<Doctor | null>(null);
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const mapsApiKey = getMapsApiKey();
  const canUseGeolocation = typeof navigator !== "undefined" && !!navigator.geolocation;

  // Load Google Maps API
  useEffect(() => {
    if (!mapsApiKey || isMapsLoaded || window.google?.maps) {
      if (window.google?.maps) {
        setIsMapsLoaded(true);
      }
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps/api/js"]');
    if (existingScript) {
      if (window.google?.maps) {
        setIsMapsLoaded(true);
      }
      return;
    }

    const scriptUrls = [
      `http://localhost:8080/maps/api/js?key=${mapsApiKey}&libraries=places&callback=initGoogleMaps`,
      `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&callback=initGoogleMaps`,
    ];

    let currentScript: HTMLScriptElement | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // Set up callback
    (window as any).initGoogleMaps = () => {
      setIsMapsLoaded(true);
      delete (window as any).initGoogleMaps;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const loadScript = (url: string, index: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Remove previous script if it exists
        if (currentScript) {
          currentScript.remove();
          currentScript = null;
        }

        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.defer = true;
        currentScript = script;

        // Set timeout for script loading (10 seconds)
        timeoutId = setTimeout(() => {
          if (currentScript === script) {
            script.remove();
            currentScript = null;
            reject(new Error(`Timeout loading script from ${url}`));
          }
        }, 10000);

        script.onload = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          // Wait a bit for the callback to fire
          setTimeout(() => {
            if (window.google?.maps) {
              resolve();
            } else {
              reject(new Error("Google Maps API loaded but not initialized"));
            }
          }, 100);
        };

        script.onerror = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          if (currentScript === script) {
            script.remove();
            currentScript = null;
          }
          reject(new Error(`Failed to load script from ${url}`));
        };

        document.head.appendChild(script);
      });
    };

    // Try loading scripts sequentially
    (async () => {
      for (let i = 0; i < scriptUrls.length; i++) {
        try {
          await loadScript(scriptUrls[i], i);
          // Success - break out of loop
          break;
        } catch (error) {
          console.warn(`Failed to load Google Maps API from ${scriptUrls[i]}, trying next source...`);
          // If this was the last URL, log error
          if (i === scriptUrls.length - 1) {
            console.error("Failed to load Google Maps API from all sources", error);
          }
        }
      }
    })();

    return () => {
      if (currentScript) {
        currentScript.remove();
        currentScript = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if ((window as any).initGoogleMaps) {
        delete (window as any).initGoogleMaps;
      }
    };
  }, [mapsApiKey, isMapsLoaded]);

  // Geocode doctors' addresses that don't have coordinates
  const geocodeDoctors = useCallback(async (doctorsList: Doctor[]) => {
    if (!isMapsLoaded || !window.google?.maps?.Geocoder) {
      return doctorsList;
    }

    const updatedDoctors = await Promise.all(
      doctorsList.map(async (doctor) => {
        // If doctor already has valid coordinates, skip
        if (doctor.location?.lat && doctor.location?.lng && doctor.location?.geocoded !== false) {
          return doctor;
        }

        // If no address, skip
        if (!doctor.location?.address) {
          return doctor;
        }

        // Try to geocode the address
        const coords = await geocodeAddress(doctor.location.address);
        if (coords) {
          return {
            ...doctor,
            location: {
              ...doctor.location,
              ...coords,
              geocoded: true,
            },
          };
        }

        // Geocoding failed - use default location but mark as not geocoded
        return {
          ...doctor,
          location: {
            ...doctor.location,
            lat: doctor.location.lat || 10.8231 + (Math.random() - 0.5) * 0.1,
            lng: doctor.location.lng || 106.6297 + (Math.random() - 0.5) * 0.1,
            geocoded: false,
          },
        };
      })
    );

    return updatedDoctors;
  }, [isMapsLoaded]);

  // Load doctors on mount
  useEffect(() => {
    const loaded = loadDoctors();
    setDoctors(loaded);
    setFilteredDoctors(loaded);
    
    // Calculate price range
    if (loaded.length > 0) {
      const prices = loaded.map(d => d.price || 0).filter(p => p > 0);
      if (prices.length > 0) {
        const maxPrice = Math.max(...prices);
        setPriceFilter([0, maxPrice]);
      }
    }
    
    const handleUpdate = async () => {
      const loaded = loadDoctors();
      // Try to geocode if Maps API is loaded
      if (isMapsLoaded) {
        const geocoded = await geocodeDoctors(loaded);
        setDoctors(geocoded);
      } else {
        setDoctors(loaded);
      }
    };
    window.addEventListener("staffUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("staffUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [isMapsLoaded, geocodeDoctors]);

  // Geocode doctors when Maps API loads
  useEffect(() => {
    if (isMapsLoaded && doctors.length > 0) {
      geocodeDoctors(doctors).then((geocoded) => {
        // Only update if coordinates changed
        const hasChanges = geocoded.some((doc, idx) => {
          const old = doctors[idx];
          return (
            doc.location?.lat !== old.location?.lat ||
            doc.location?.lng !== old.location?.lng ||
            doc.location?.geocoded !== old.location?.geocoded
          );
        });
        if (hasChanges) {
          setDoctors(geocoded);
        }
      });
    }
  }, [isMapsLoaded]);

  const requestUserLocation = useCallback(() => {
    if (!canUseGeolocation) {
      console.warn("Trình duyệt không hỗ trợ xác định vị trí.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setMapCenter(coords);
      },
      () => {
        console.warn("Không thể lấy vị trí người dùng.");
      }
    );
  }, [canUseGeolocation]);

  // Get user location
  useEffect(() => {
    if (viewMode === "map" || distanceFilter > 0) {
      requestUserLocation();
    }
  }, [viewMode, distanceFilter, requestUserLocation]);

  // Get unique specialties
  const specialties = useMemo(() => {
    const unique = new Set(doctors.map(d => d.specialty));
    return Array.from(unique).sort();
  }, [doctors]);

  const getDistanceKm = (pointA: { lat: number; lng: number }, pointB: { lat: number; lng: number }) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(pointB.lat - pointA.lat);
    const dLng = toRad(pointB.lng - pointA.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(pointA.lat)) * Math.cos(toRad(pointB.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter doctors
  useEffect(() => {
    let filtered = [...doctors];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.specialty.toLowerCase().includes(query) ||
          d.location?.address.toLowerCase().includes(query)
      );
    }

    // Specialty filter
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((d) => d.specialty === selectedSpecialty);
    }

    // Rating filter
    filtered = filtered.filter(
      (d) => d.rating >= ratingFilter[0] && d.rating <= ratingFilter[1]
    );

    // Price filter
    filtered = filtered.filter(
      (d) => (d.price || 0) >= priceFilter[0] && (d.price || 0) <= priceFilter[1]
    );

    // Distance filter (km)
    if (distanceFilter > 0 && userLocation) {
      filtered = filtered.filter((d) => {
        if (!d.location) return false;
        const distance = getDistanceKm(userLocation, d.location);
        return distance <= distanceFilter;
      });
    }

    // Sort by rating (highest first)
    filtered.sort((a, b) => b.rating - a.rating);

    setFilteredDoctors(filtered);
  }, [doctors, searchQuery, selectedSpecialty, ratingFilter, priceFilter, distanceFilter, userLocation]);

  const handleBookingClick = (doctor: Doctor) => {
    const user = getCurrentUser();
    if (!user) {
      setShowAuthDialog(true);
      setIsDetailOpen(false);
      return;
    }

    if (user.role !== "patient") {
      navigate("/login", {
        state: { returnPath: "/patient/book", specialty: doctor.specialty },
      });
      setIsDetailOpen(false);
      return;
    }

    navigate("/patient/book", {
      state: { specialty: doctor.specialty, doctorName: doctor.name },
    });
    setIsDetailOpen(false);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("all");
    setRatingFilter([0, 5]);
    const maxPrice = Math.max(...doctors.map(d => d.price || 0).filter(p => p > 0), 1000000);
    setPriceFilter([0, maxPrice]);
    setDistanceFilter(0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const mapContainerStyle = {
    width: "100%",
    height: "600px",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Tìm kiếm Bác sĩ Nâng cao</h1>
          <p className="text-primary-foreground/80">
            Tìm bác sĩ phù hợp với nhu cầu của bạn
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên bác sĩ, chuyên khoa, địa chỉ..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                {specialties.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
                  <SheetDescription>
                    Tùy chỉnh các tiêu chí tìm kiếm của bạn
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Rating Filter */}
                  <div>
                    <Label className="mb-2 block">
                      Đánh giá: {ratingFilter[0].toFixed(1)} - {ratingFilter[1].toFixed(1)} ⭐
                    </Label>
                    <Slider
                      value={ratingFilter}
                      onValueChange={setRatingFilter}
                      min={0}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Price Filter */}
                  <div>
                    <Label className="mb-2 block">
                      Giá khám: {formatPrice(priceFilter[0])} - {formatPrice(priceFilter[1])}
                    </Label>
                    <Slider
                      value={priceFilter}
                      onValueChange={setPriceFilter}
                      min={0}
                      max={Math.max(...doctors.map(d => d.price || 0).filter(p => p > 0), 1000000)}
                      step={50000}
                      className="w-full"
                    />
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        Bán kính: {distanceFilter > 0 ? `${distanceFilter} km` : "Toàn bộ vị trí"}
                      </Label>
                      <Button size="sm" variant="outline" onClick={requestUserLocation} disabled={!canUseGeolocation}>
                        <Navigation className="h-4 w-4 mr-2" />
                        Lấy vị trí
                      </Button>
                    </div>
                    <Slider
                      value={[distanceFilter]}
                      onValueChange={(val) => setDistanceFilter(val[0] ?? 0)}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                      disabled={!userLocation}
                    />
                    {!userLocation && (
                      <p className="text-xs text-muted-foreground">
                        Bật bản đồ hoặc nhấn "Lấy vị trí" để dùng bộ lọc khoảng cách.
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Đặt lại bộ lọc
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                Danh sách
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                onClick={() => setViewMode("map")}
                className="gap-2"
                disabled={!mapsApiKey}
              >
                <Map className="h-4 w-4" />
                Bản đồ
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedSpecialty !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {selectedSpecialty}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedSpecialty("all")}
                />
              </Badge>
            )}
            {(ratingFilter[0] > 0 || ratingFilter[1] < 5) && (
              <Badge variant="secondary" className="gap-1">
                Đánh giá: {ratingFilter[0].toFixed(1)}-{ratingFilter[1].toFixed(1)}⭐
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setRatingFilter([0, 5])}
                />
              </Badge>
            )}
            {(priceFilter[0] > 0 || priceFilter[1] < 1000000) && (
              <Badge variant="secondary" className="gap-1">
                Giá: {formatPrice(priceFilter[0])}-{formatPrice(priceFilter[1])}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    const maxPrice = Math.max(...doctors.map(d => d.price || 0).filter(p => p > 0), 1000000);
                    setPriceFilter([0, maxPrice]);
                  }}
                />
              </Badge>
            )}
            {distanceFilter > 0 && (
              <Badge variant="secondary" className="gap-1">
                Bán kính: {distanceFilter} km
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setDistanceFilter(0)}
                />
              </Badge>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Tìm thấy {filteredDoctors.length} bác sĩ
          </div>
        </div>

        {/* Results */}
        {viewMode === "list" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setIsDetailOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      {doctor.name.split(" ").pop()?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{doctor.name}</h3>
                      <Badge variant="secondary" className="mb-2">
                        {doctor.specialty}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {doctor.experience}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{doctor.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({doctor.reviews} đánh giá)
                      </span>
                    </div>
                    {doctor.price && (
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <DollarSign className="h-4 w-4" />
                        {formatPrice(doctor.price)}
                      </div>
                    )}
                    {doctor.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate max-w-[200px]">
                          {doctor.location.address}
                        </span>
                        {doctor.location.geocoded === false && (
                          <span
                            className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
                            title="Địa chỉ này không tìm thấy trên Google Maps. Vị trí hiển thị có thể không chính xác."
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/50 p-4">
                  <Button
                    className="w-full gap-2"
                    variant={doctor.available ? "default" : "outline"}
                    disabled={!doctor.available}
                    onClick={(e) => {
                      e.stopPropagation();
                      doctor.available && handleBookingClick(doctor);
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                    {doctor.available ? "Đặt lịch ngay" : "Hết lịch"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {mapsApiKey && isMapsLoaded ? (
              <>
                <div className="relative">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={12}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                    }}
                  >
                    {/* User location marker */}
                    {userLocation && (
                      <Marker
                        position={userLocation}
                        icon={{
                          path: window.google?.maps?.SymbolPath?.CIRCLE,
                          scale: 8,
                          fillColor: "#4285F4",
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                        }}
                        title="Vị trí của bạn"
                      />
                    )}

                    {/* Doctor markers */}
                    {filteredDoctors.map((doctor) => {
                      if (!doctor.location) return null;
                      // Use amber color if address was not geocoded successfully
                      const isGeocoded = doctor.location.geocoded !== false;
                      const markerColor = !isGeocoded
                        ? "#F59E0B" // Amber for ungeocoded addresses
                        : doctor.available
                        ? "#10B981" // Green for available
                        : "#EF4444"; // Red for unavailable
                      return (
                        <Marker
                          key={doctor.id}
                          position={{ lat: doctor.location.lat, lng: doctor.location.lng }}
                          onClick={() => setSelectedMapDoctor(doctor)}
                          icon={{
                            path: window.google?.maps?.SymbolPath?.CIRCLE,
                            scale: 10,
                            fillColor: markerColor,
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                          }}
                        />
                      );
                    })}

                    {/* Info Window */}
                    {selectedMapDoctor && selectedMapDoctor.location && (
                      <InfoWindow
                        position={{
                          lat: selectedMapDoctor.location.lat,
                          lng: selectedMapDoctor.location.lng,
                        }}
                        onCloseClick={() => setSelectedMapDoctor(null)}
                      >
                        <div className="p-2 max-w-[250px]">
                          <h3 className="font-semibold mb-1">{selectedMapDoctor.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {selectedMapDoctor.specialty}
                          </p>
                          {selectedMapDoctor.location?.geocoded === false && (
                            <div className="flex items-center gap-1 mb-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Địa chỉ có thể không chính xác</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{selectedMapDoctor.rating.toFixed(1)}</span>
                          </div>
                          {selectedMapDoctor.price && (
                            <p className="text-sm font-semibold text-primary mb-2">
                              {formatPrice(selectedMapDoctor.price)}
                            </p>
                          )}
                          {selectedMapDoctor.location && (
                            <p className="text-xs text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {selectedMapDoctor.location.address}
                            </p>
                          )}
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setSelectedDoctor(selectedMapDoctor);
                              setSelectedMapDoctor(null);
                              setIsDetailOpen(true);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </div>

                {/* Doctor List below map */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Danh sách bác sĩ ({filteredDoctors.length})
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDoctors.map((doctor) => (
                      <Card
                        key={doctor.id}
                        className="cursor-pointer hover:shadow-md transition-all"
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setIsDetailOpen(true);
                          if (doctor.location) {
                            setMapCenter({
                              lat: doctor.location.lat,
                              lng: doctor.location.lng,
                            });
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-lg font-bold text-primary-foreground flex-shrink-0">
                              {doctor.name.split(" ").pop()?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{doctor.name}</h4>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {doctor.specialty}
                              </Badge>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{doctor.rating.toFixed(1)}</span>
                              </div>
                              {doctor.location && (
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  {doctor.location.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : mapsApiKey && !isMapsLoaded ? (
              <Card className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <h3 className="text-lg font-semibold mb-2">Đang tải Google Maps...</h3>
                <p className="text-sm text-muted-foreground">
                  Vui lòng đợi trong giây lát.
                </p>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Google Maps chưa được cấu hình
                </h3>
                <p className="text-muted-foreground mb-4">
                  Vui lòng thêm Google Maps API Key trong Settings để sử dụng tính năng bản đồ.
                </p>
                <Button variant="outline" onClick={() => navigate("/dashboard/settings")}>
                  Đi đến Settings
                </Button>
              </Card>
            )}
          </div>
        )}

        {filteredDoctors.length === 0 && (
          <Card className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy bác sĩ</h3>
            <p className="text-muted-foreground mb-4">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Đặt lại bộ lọc
            </Button>
          </Card>
        )}
      </div>

      {/* Doctor Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl font-bold text-primary-foreground">
                    {selectedDoctor.name.split(" ").pop()?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedDoctor.name}</DialogTitle>
                    <Badge variant="secondary" className="mb-2">
                      {selectedDoctor.specialty}
                    </Badge>
                    <DialogDescription className="text-base mt-2">
                      {selectedDoctor.experience}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <div>
                      <p className="font-semibold text-lg">{selectedDoctor.rating.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.reviews} đánh giá
                      </p>
                    </div>
                  </div>
                  {selectedDoctor.price && (
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-lg">{formatPrice(selectedDoctor.price)}</p>
                        <p className="text-sm text-muted-foreground">Phí khám</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedDoctor.location && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Địa chỉ
                      {selectedDoctor.location.geocoded === false && (
                        <span
                          className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-normal"
                          title="Địa chỉ này không tìm thấy trên Google Maps. Vị trí hiển thị có thể không chính xác."
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span className="hidden sm:inline">Có thể không chính xác</span>
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoctor.location.address}
                    </p>
                    {mapsApiKey && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 gap-2"
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedDoctor.location!.lat},${selectedDoctor.location!.lng}`;
                          window.open(url, "_blank");
                        }}
                      >
                        <Navigation className="h-4 w-4" />
                        Chỉ đường
                      </Button>
                    )}
                  </div>
                )}

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Thông tin bác sĩ</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoctor.name} là bác sĩ chuyên khoa {selectedDoctor.specialty} với{" "}
                    {selectedDoctor.experience.toLowerCase()}. Bác sĩ đã nhận được{" "}
                    {selectedDoctor.reviews} đánh giá tích cực từ bệnh nhân với điểm trung bình{" "}
                    {selectedDoctor.rating.toFixed(1)}/5.0.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  className="flex-1 gap-2"
                  disabled={!selectedDoctor.available}
                  onClick={() => handleBookingClick(selectedDoctor)}
                >
                  <Calendar className="h-4 w-4" />
                  Đặt lịch ngay
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
};

export default AdvancedDoctorSearch;

 