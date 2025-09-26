import { type NextPage } from "next";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useUserStore } from "../store/userStore";
import { getChapters, getUserProgress } from "../lib/api";
import { Chapter } from "../types";

// Define types for the learning path
type TileStatus = "LOCKED" | "ACTIVE" | "COMPLETE";
type TileType = "lesson" | "checkpoint" | "treasure" | "practice";

interface Unit {
  unitNumber: number;
  chapterName: string;
  description: string;
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
  textColor: `text-${string}`;
  tiles: Tile[];
  hasRealContent: boolean;
}

interface Tile {
  type: TileType;
  description: string;
}

// Dynamic chapter data - from API
const createUnitsFromChapters = (chapters: Chapter[]): Unit[] => {
  const chapterConfigs = [
    { 
      name: "Basics", 
      description: "Learn basic signs and concepts",
      backgroundColor: "bg-green-500" as const,
      borderColor: "border-green-600" as const,
      textColor: "text-green-500" as const,
    },
    { 
      name: "Greetings", 
      description: "Master greeting signs",
      backgroundColor: "bg-blue-500" as const,
      borderColor: "border-blue-600" as const,
      textColor: "text-blue-500" as const,
    },
    { 
      name: "Family", 
      description: "Family members and relationships",
      backgroundColor: "bg-purple-500" as const,
      borderColor: "border-purple-600" as const,
      textColor: "text-purple-500" as const,
    },
    { 
      name: "Food Signs", 
      description: "Food and drinks vocabulary",
      backgroundColor: "bg-orange-500" as const,
      borderColor: "border-orange-600" as const,
      textColor: "text-orange-500" as const,
    },
    { 
      name: "Numbers", 
      description: "Numbers and counting",
      backgroundColor: "bg-red-500" as const,
      borderColor: "border-red-600" as const,
      textColor: "text-red-500" as const,
    },
  ];

  return chapters.map((chapter, index) => {
    const config = chapterConfigs.find(c => c.name === chapter.name) || chapterConfigs[0];
    // Only "Basics" has real content (Vimeo URLs), others have example.com placeholder URLs
    const hasRealContent = chapter.name === 'Basics';
    
    return {
      unitNumber: index + 1,
      chapterName: chapter.name,
      description: config.description,
      backgroundColor: config.backgroundColor,
      borderColor: config.borderColor,
      textColor: config.textColor,
      hasRealContent,
      tiles: [
        { type: "lesson" as const, description: `Learn ${chapter.name}` },
        { type: "practice" as const, description: "Practice Session" },
        { type: "checkpoint" as const, description: `${chapter.name} Review` },
      ],
    };
  });
};

// Helper functions
const tileStatus = (tile: Tile, chaptersCompleted: number, tileIndex: number): TileStatus => {
  const tilesCompleted = chaptersCompleted;
  
  if (tileIndex < tilesCompleted) {
    return "COMPLETE";
  }
  if (tileIndex > tilesCompleted) {
    return "LOCKED";
  }
  return "ACTIVE";
};

// Status bar removed - content moved to LeftBar and RightBar

// Left sidebar
const LeftBar = ({ selectedTab }: { selectedTab: string }) => {
  const router = useRouter();
  const { setUser } = useUserStore();
  
  const handleLogout = () => {
    setUser(null);
    router.replace('/');
  };
  
  return (
    <div className="fixed left-0 top-0 bottom-0 z-50 hidden w-64 border-r-2 border-gray-200 bg-white md:flex md:flex-col lg:w-80 overflow-y-auto shadow-md">
      <div className="p-6 flex-grow">
        {/* App Logo and Name - Moved from TopBar */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-md">
            <span className="text-2xl">🤟</span>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-800">SLSL Learning</div>
            <div className="text-xs text-gray-500">Sign Language Journey</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              href="/practice"
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
            >
              <span className="text-2xl">⚡</span>
              <div>
                <div className="font-bold text-gray-800">Practice</div>
                <div className="text-sm text-gray-600">Quick review</div>
              </div>
            </Link>
            <Link 
              href="/leaderboard"
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-2xl">🏆</span>
              <div>
                <div className="font-bold text-gray-800">Leaderboard</div>
                <div className="text-sm text-gray-600">See rankings</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Logout button at the bottom */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all"
        >
          <span className="text-2xl">🚪</span>
          <div>
            <div className="font-bold text-gray-800">Logout</div>
            <div className="text-sm text-gray-600">End your session</div>
          </div>
        </button>
      </div>
    </div>
  );
};

// Right sidebar
const RightBar = ({ stats = { streak: 0, xp: 66, hearts: 4 } }) => {
  return (
    <div className="sticky top-5 hidden w-80 flex-col gap-5 xl:flex h-fit">
      {/* Stats panel - Moved from TopBar */}
      <div className="rounded-xl border-2 border-gray-200 p-4 bg-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
            <span className="text-xl">🔥</span>
            <div>
              <div className="font-bold text-red-600 text-lg">0</div>
              <div className="text-xs text-red-500">Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-xl">💎</span>
            <div>
              <div className="font-bold text-blue-600 text-lg">66</div>
              <div className="text-xs text-blue-500">XP</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg">
            <span className="text-xl">❤️</span>
            <div>
              <div className="font-bold text-pink-600 text-lg">4</div>
              <div className="text-xs text-pink-500">Hearts</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl border-2 border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Daily Quest</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Complete 2 lessons</span>
            <span className="text-sm font-bold text-green-600">1/2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-1/2"></div>
          </div>
          <div className="text-xs text-gray-500">+15 XP reward</div>
        </div>
      </div>
      
      <div className="rounded-xl border-2 border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Friends</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">User 01</div>
              <div className="text-xs text-gray-500">1,250 XP</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">User 02</div>
              <div className="text-xs text-gray-500">980 XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tile positioning classes
const tileLeftClassNames = [
  "left-0",
  "left-[-45px]",
  "left-[-70px]",
  "left-[-45px]",
  "left-0",
  "left-[45px]",
  "left-[70px]",
  "left-[45px]",
] as const;

type TileLeftClassName = (typeof tileLeftClassNames)[number];

const getTileLeftClassName = ({
  index,
  unitNumber,
  tilesLength,
}: {
  index: number;
  unitNumber: number;
  tilesLength: number;
}): TileLeftClassName => {
  if (index >= tilesLength - 1) {
    return "left-0";
  }

  const classNames =
    unitNumber % 2 === 1
      ? tileLeftClassNames
      : [...tileLeftClassNames.slice(4), ...tileLeftClassNames.slice(0, 4)];

  return classNames[index % classNames.length] ?? "left-0";
};

// Tile Icon Component
const TileIcon = ({
  tileType,
  status,
}: {
  tileType: TileType;
  status: TileStatus;
}) => {
  const getIconAndColor = () => {
    switch (tileType) {
      case "lesson":
        return {
          icon: status === "COMPLETE" ? "✅" : status === "ACTIVE" ? "📚" : "🔒",
          bgColor: status === "COMPLETE" ? "bg-yellow-400" : status === "ACTIVE" ? "bg-green-500" : "bg-gray-300",
          borderColor: status === "COMPLETE" ? "border-yellow-500" : status === "ACTIVE" ? "border-green-600" : "border-gray-400",
          hoverEffect: status === "LOCKED" ? "" : "hover:scale-110 transform transition-transform duration-200"
        };
      case "practice":
        return {
          icon: status === "COMPLETE" ? "✅" : status === "ACTIVE" ? "💪" : "🔒",
          bgColor: status === "COMPLETE" ? "bg-yellow-400" : status === "ACTIVE" ? "bg-blue-500" : "bg-gray-300",
          borderColor: status === "COMPLETE" ? "border-yellow-500" : status === "ACTIVE" ? "border-blue-600" : "border-gray-400",
          hoverEffect: status === "LOCKED" ? "" : "hover:scale-110 transform transition-transform duration-200"
        };
      case "checkpoint":
        return {
          icon: status === "COMPLETE" ? "🏆" : status === "ACTIVE" ? "🎯" : "🔒",
          bgColor: status === "COMPLETE" ? "bg-yellow-400" : status === "ACTIVE" ? "bg-purple-500" : "bg-gray-300",
          borderColor: status === "COMPLETE" ? "border-yellow-500" : status === "ACTIVE" ? "border-purple-600" : "border-gray-400",
          hoverEffect: status === "LOCKED" ? "" : "hover:scale-110 transform transition-transform duration-200"
        };
      case "treasure":
        return {
          icon: status === "COMPLETE" ? "💰" : status === "ACTIVE" ? "🎁" : "🔒",
          bgColor: status === "COMPLETE" ? "bg-yellow-400" : status === "ACTIVE" ? "bg-orange-500" : "bg-gray-300",
          borderColor: status === "COMPLETE" ? "border-yellow-500" : status === "ACTIVE" ? "border-orange-600" : "border-gray-400",
          hoverEffect: status === "LOCKED" ? "" : "hover:scale-110 transform transition-transform duration-200"
        };
      default:
        return {
          icon: "❓",
          bgColor: "bg-gray-300",
          borderColor: "border-gray-400",
          hoverEffect: ""
        };
    }
  };

  const { icon, bgColor, borderColor, hoverEffect } = getIconAndColor();

  return (
    <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center text-2xl border-4 ${borderColor} shadow-lg ${hoverEffect}`}>
      {icon}
    </div>
  );
};

// Tile Tooltip Component
const TileTooltip = ({
  selectedTile,
  index,
  description,
  status,
  closeTooltip,
  unit,
}: {
  selectedTile: number | null;
  index: number;
  description: string;
  status: TileStatus;
  closeTooltip: () => void;
  unit: Unit;
}) => {
  const tileTooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const containsTileTooltip = (event: MouseEvent) => {
      if (selectedTile !== index) return;
      const clickIsInsideTooltip = tileTooltipRef.current?.contains(
        event.target as Node,
      );
      if (clickIsInsideTooltip) return;
      closeTooltip();
    };

    window.addEventListener("click", containsTileTooltip, true);
    return () => window.removeEventListener("click", containsTileTooltip, true);
  }, [selectedTile, tileTooltipRef, closeTooltip, index]);

  // Get icons based on tile type
  const getTileTypeInfo = () => {
    switch (unit.tiles[index]?.type) {
      case "lesson":
        return { icon: "📚", label: "Lesson" };
      case "practice":
        return { icon: "💪", label: "Practice" };
      case "checkpoint":
        return { icon: "🎯", label: "Checkpoint" };
      case "treasure":
        return { icon: "🎁", label: "Reward" };
      default:
        return { icon: "📌", label: "Activity" };
    }
  };

  const { icon, label } = getTileTypeInfo();

  return (
    <div
      className={[
        "relative h-0 w-full",
        index === selectedTile ? "" : "invisible",
      ].join(" ")}
      ref={tileTooltipRef}
    >
      <div
        className={[
          "absolute z-30 flex w-[320px] flex-col gap-4 rounded-xl shadow-lg transition-all duration-300 left-1/2 transform -translate-x-1/2",
          status === "ACTIVE"
            ? unit.backgroundColor
            : status === "LOCKED"
              ? "border border-gray-200 bg-gray-100"
              : "bg-yellow-400",
          index === selectedTile ? "top-6 scale-100 opacity-100" : "-top-14 scale-90 opacity-0",
        ].join(" ")}
      >
        {/* Triangle pointer */}
        <div
          className={[
            "absolute left-1/2 top-[-8px] h-4 w-4 -translate-x-1/2 rotate-45",
            status === "ACTIVE"
              ? unit.backgroundColor
              : status === "LOCKED"
                ? "border-l border-t border-gray-200 bg-gray-100"
                : "bg-yellow-400",
          ].join(" ")}
        ></div>
        
        {/* Header with type indicator */}
        <div className="px-4 pt-3 pb-2 border-b border-white/20">
          <div className="flex items-center gap-2">
            <span className="inline-block p-1.5 bg-white/20 rounded-md">{icon}</span>
            <span className={[
              "text-sm font-medium",
              status === "ACTIVE"
                ? "text-white/80"
                : status === "LOCKED"
                  ? "text-gray-500"
                  : "text-yellow-700/80",
            ].join(" ")}>{label}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4">
          <div
            className={[
              "text-lg font-bold",
              status === "ACTIVE"
                ? "text-white"
                : status === "LOCKED"
                  ? "text-gray-500"
                  : "text-yellow-700",
            ].join(" ")}
          >
            {description}
          </div>
          
          {/* XP indicator for active tiles */}
          {status === "ACTIVE" && (
            <div className="flex items-center gap-2 mt-1 text-sm text-white/80">
              <span className="inline-block">💎</span>
              <span>Earn 10 XP</span>
            </div>
          )}
        </div>
        
        {/* Footer with action button */}
        <div className="p-3">
          {status === "ACTIVE" ? (
            <div className="space-y-2">
              {!unit.hasRealContent && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2">
                  <span className="text-amber-600 text-sm">⚠️</span>
                  <span className="text-xs text-amber-700">Preview content</span>
                </div>
              )}
              <Link
                href={`/session/${encodeURIComponent(unit.chapterName)}`}
                className={[
                  "flex w-full items-center justify-center rounded-xl border-b-4 border-gray-200 bg-white p-3 font-bold uppercase",
                  unit.textColor,
                ].join(" ")}
              >
                Start Lesson
              </Link>
            </div>
          ) : status === "LOCKED" ? (
            <div className="w-full p-3">
              <button
                className="w-full rounded-xl bg-gray-200 p-3 uppercase text-gray-400 font-bold cursor-not-allowed opacity-80"
                disabled
              >
                Locked
              </button>
              <div className="text-xs text-center mt-2 text-gray-500">Complete previous lessons to unlock</div>
            </div>
          ) : (
            <Link
              href={`/session/${encodeURIComponent(unit.chapterName)}`}
              className="flex w-full items-center justify-center rounded-xl border-b-4 border-yellow-600 bg-white p-3 uppercase text-yellow-600 font-bold"
            >
              Practice Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Unit Section Component
interface UnitSectionProps {
  unit: Unit;
  chaptersCompleted: number;
}

const UnitSection = ({ unit, chaptersCompleted }: UnitSectionProps) => {
  const [selectedTile, setSelectedTile] = useState<null | number>(null);

  useEffect(() => {
    const unselectTile = () => setSelectedTile(null);
    window.addEventListener("scroll", unselectTile);
    return () => window.removeEventListener("scroll", unselectTile);
  }, []);

  const closeTooltip = useCallback(() => setSelectedTile(null), []);

  // Create connecting lines between tiles
  const ConnectingLine = ({ index }: { index: number }) => {
    if (index === 0) return null;
    
    const lineClass = unit.unitNumber % 2 === 1
      ? (index % 2 === 1 ? "rotate-[135deg]" : "rotate-[45deg]")
      : (index % 2 === 1 ? "rotate-[45deg]" : "rotate-[135deg]");
      
    return (
      <div className={`absolute h-16 w-[2px] bg-gray-300 origin-top ${lineClass}`}></div>
    );
  };

  // Add hover label for active tiles
  const HoverLabel = ({ status, type }: { status: TileStatus; type: TileType }) => {
    if (status !== "ACTIVE") return null;

    let text = "";
    let color = "";

    switch (type) {
      case "lesson":
        text = "Start Lesson";
        color = "bg-green-500 text-white";
        break;
      case "practice":
        text = "Practice";
        color = "bg-blue-500 text-white";
        break;
      case "checkpoint":
        text = "Take Quiz";
        color = "bg-purple-500 text-white";
        break;
      case "treasure":
        text = "Open Reward";
        color = "bg-orange-500 text-white";
        break;
    }

    return (
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
        <div className={`px-3 py-1 rounded-md ${color} text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity`}>
          {text}
        </div>
        <div className={`w-2 h-2 rotate-45 ${color.split(" ")[0]} absolute -bottom-1 left-1/2 transform -translate-x-1/2`}></div>
      </div>
    );
  };

  return (
    <>
      <UnitHeader unit={unit} />
      <div className="relative mb-12 mt-16 flex max-w-2xl flex-col items-center">
        <div className="py-12 w-full relative flex flex-col items-center">
          {/* Unit path - zigzag pattern */}
          {unit.tiles.map((tile, i) => {
            const globalTileIndex = (unit.unitNumber - 1) * 4 + i;
            const status = tileStatus(tile, chaptersCompleted, globalTileIndex);
            
            return (
              <Fragment key={i}>
                <div
                  className={[
                    "relative mb-16 h-[93px] w-[98px] group",
                    getTileLeftClassName({
                      index: i,
                      unitNumber: unit.unitNumber,
                      tilesLength: unit.tiles.length,
                    }),
                  ].join(" ")}
                >
                  <ConnectingLine index={i} />
                  <HoverLabel status={status} type={tile.type} />
                  
                  <button
                    className={`absolute rounded-full p-4 transition-all ${
                      status === "ACTIVE" 
                        ? "shadow-lg hover:shadow-xl" 
                        : status === "COMPLETE" 
                          ? "shadow-md hover:shadow-lg" 
                          : "shadow"
                    }`}
                    onClick={() => setSelectedTile(i)}
                    disabled={status === "LOCKED"}
                  >
                    <TileIcon tileType={tile.type} status={status} />
                    <span className="sr-only">Show lesson</span>
                  </button>
                </div>
                <TileTooltip
                  selectedTile={selectedTile}
                  index={i}
                  description={tile.description}
                  status={status}
                  closeTooltip={closeTooltip}
                  unit={unit}
                />
              </Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
};

// Unit Header Component
const UnitHeader = ({ unit }: { unit: Unit }) => {
  return (
    <article
      className={["max-w-2xl text-white sm:rounded-2xl shadow-lg", unit.backgroundColor].join(" ")}
    >
      <header className="flex items-center justify-between gap-4 p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold">Unit {unit.unitNumber}</span>
            {unit.unitNumber > 1 && 
              <span className="inline-block px-2 py-0.5 bg-white/10 rounded-md text-xs">
                {unit.unitNumber === 2 ? "Intermediate" : "Advanced"}
              </span>
            }
          </div>
          <h2 className="text-2xl font-bold">{unit.description}</h2>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="bg-white/20 px-2 py-0.5 rounded-md">4 lessons</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span>🔍</span>
              <span>Learn details</span>
            </span>
          </div>
        </div>
        <div className="text-4xl bg-white/10 p-4 rounded-2xl shadow-inner">🤟</div>
      </header>
      <div className={`h-2 w-full ${unit.borderColor}`}></div>
    </article>
  );
};

// TopBar colors removed 

// Main Dashboard Component
const Dashboard: NextPage = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [stats, setStats] = useState({ xp: 66, streak: 0, hearts: 4, due_cards_by_chapter: {} });
  const [scrollY, setScrollY] = useState(0);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    const updateScrollY = () => setScrollY(globalThis.scrollY ?? scrollY);
    updateScrollY();
    document.addEventListener("scroll", updateScrollY);
    return () => document.removeEventListener("scroll", updateScrollY);
  }, [scrollY]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          router.replace('/');
          return;
        }

        const [chaptersData, progressData] = await Promise.all([
          getChapters(),
          getUserProgress(user.user_id)
        ]);

        const level = Math.floor(progressData.xp / 100) + 1;
        const chapterList = chaptersData.map((name: string) => ({
          name,
          dueCards: progressData.due_cards_by_chapter[name] || 0,
          unlocked: level >= ['Basics', 'Greetings', 'Food Signs', 'Family', 'Numbers']
            .indexOf(name) + 1
        }));

        setChapters(chapterList);
        setStats(progressData);
        
        // Create units from chapters
        setUnits(createUnitsFromChapters(chapterList));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const { useUserStore } = await import('../store/userStore');
        useUserStore.getState().setUser(null);
        router.replace('/');
      }
    };

    fetchData();
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const chaptersCompleted = Math.floor(stats.xp / 50); // Simple calculation for completed chapters

  return (
    <>
      <LeftBar selectedTab="Learn" />

      <div className="flex justify-center gap-3 pt-5 px-4 sm:px-6 md:ml-64 lg:ml-80 lg:gap-12">
        <div className="flex max-w-2xl grow flex-col">
          {units.map((unit) => (
            <UnitSection 
              key={unit.unitNumber}
              unit={unit} 
              chaptersCompleted={chaptersCompleted}
            />
          ))}
          <div className="sticky bottom-10 left-0 right-0 flex items-end justify-between z-20">
            <Link
              href="/demo"
              className="absolute left-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-b-4 border-gray-200 bg-white shadow-lg transition hover:bg-gray-50 hover:scale-105 md:left-0"
            >
              <span className="sr-only">Practice exercise</span>
              <span className="text-2xl">⚡</span>
            </Link>
            {scrollY > 100 && (
              <button
                className="absolute right-4 flex h-14 w-14 items-center justify-center self-end rounded-2xl border-2 border-b-4 border-gray-200 bg-white shadow-lg transition hover:bg-gray-50 hover:scale-105 md:right-0"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <span className="sr-only">Jump to top</span>
                <span className="text-xl">↑</span>
              </button>
            )}
          </div>
        </div>
        <RightBar stats={stats} />
      </div>

      <div className="pb-[90px]"></div>
    </>
  );
};

export default Dashboard;