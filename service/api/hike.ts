import client from "../clients";

// ============ INTERFACES ============

// Hike type
export interface Hike {
  hikeId: number;
  userId: number;
  name: string;
  location: string;
  hikeDate: string;
  parkingAvailable: boolean;
  length: number;
  difficultyLevel: "Easy" | "Moderate" | "Difficult" | "Expert";
  description?: string | null;
  estimatedDuration?: string | null;
  elevationGain?: number | null;
  trailType?: string | null;
  equipmentNeeded?: string | null;
  weatherConditions?: string | null;
  username?: string;
  userAvatar?: string | null;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create Hike Request
export interface CreateHikeRequest {
  name: string;
  location: string;
  hikeDate: string; // ISO date format: "2024-01-15"
  parkingAvailable: boolean;
  length: number;
  difficultyLevel: "Easy" | "Moderate" | "Difficult" | "Expert";
  description?: string;
  estimatedDuration?: string;
  elevationGain?: number;
  trailType?: string;
  equipmentNeeded?: string;
  weatherConditions?: string;
}

// Create Hike Response
export interface CreateHikeResponse {
  message: string;
  hikeId: number;
  hike: {
    hikeId: number;
    userId: number;
    name: string;
    location: string;
    hikeDate: string;
    parkingAvailable: boolean;
    length: number;
    difficultyLevel: string;
  };
}

// Update Hike Request (all fields optional)
export interface UpdateHikeRequest {
  name?: string;
  location?: string;
  hikeDate?: string;
  parkingAvailable?: boolean;
  length?: number;
  difficultyLevel?: "Easy" | "Moderate" | "Difficult" | "Expert";
  description?: string;
  estimatedDuration?: string;
  elevationGain?: number;
  trailType?: string;
  equipmentNeeded?: string;
  weatherConditions?: string;
}

// Update Hike Response
export interface UpdateHikeResponse {
  message: string;
}

// Delete Hike Response
export interface DeleteHikeResponse {
  message: string;
}

// Get User Hikes Response
export interface GetUserHikesResponse {
  count: number;
  hikes: Hike[];
}

// Get Hike By ID Response
export type GetHikeByIdResponse = Hike

// Search Hikes Response
export interface SearchHikesResponse {
  count: number;
  hikes: Hike[];
}

// Advanced Search Request
export interface AdvancedSearchRequest {
  name?: string;
  location?: string;
  length?: number;
  date?: string;
}

// Error Response
export interface HikeErrorResponse {
  error?: string;
  errors?: {
    field: string;
    msg: string;
  }[];
}

// Get All Hikes Request (filters)
export interface GetAllHikesRequest {
  difficulty?: "Easy" | "Moderate" | "Difficult" | "Expert";
  location?: string;
  limit?: number;
  offset?: number;
}

// Get All Hikes Response
export interface GetAllHikesResponse {
  count: number;
  hikes: Hike[];
}

// ============ API FUNCTIONS ============

/**
 * Create a new hike
 */
export const createHike = async (
  data: CreateHikeRequest
): Promise<CreateHikeResponse> => {
  try {
    const response = await client.post<CreateHikeResponse>("/hikes", {
      name: data.name,
      location: data.location,
      hikeDate: data.hikeDate,
      parkingAvailable: data.parkingAvailable,
      length: data.length,
      difficultyLevel: data.difficultyLevel,
      description: data.description,
      estimatedDuration: data.estimatedDuration,
      elevationGain: data.elevationGain,
      trailType: data.trailType,
      equipmentNeeded: data.equipmentNeeded,
      weatherConditions: data.weatherConditions,
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get all hikes for the authenticated user
 */
export const getUserHikes = async (): Promise<GetUserHikesResponse> => {
  try {
    const response = await client.get<GetUserHikesResponse>("/hikes");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get a specific hike by ID
 */
export const getHikeById = async (
  hikeId: number
): Promise<GetHikeByIdResponse> => {
  try {
    const response = await client.get<GetHikeByIdResponse>(
      `/hikes/${hikeId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update a hike
 */
export const updateHike = async (
  hikeId: number,
  data: UpdateHikeRequest
): Promise<UpdateHikeResponse> => {
  try {
    const response = await client.put<UpdateHikeResponse>(
      `/hikes/${hikeId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Delete a hike
 */
export const deleteHike = async (
  hikeId: number
): Promise<DeleteHikeResponse> => {
  try {
    const response = await client.delete<DeleteHikeResponse>(
      `/hikes/${hikeId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Search hikes by name
 */
export const searchHikesByName = async (
  name: string
): Promise<SearchHikesResponse> => {
  try {
    const response = await client.get<SearchHikesResponse>(
      "/hikes/search/name",
      {
        params: { name },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Advanced search for hikes
 */
export const advancedSearchHikes = async (
  filters: AdvancedSearchRequest
): Promise<SearchHikesResponse> => {
  try {
    const response = await client.get<SearchHikesResponse>(
      "/hikes/search/advanced",
      {
        params: filters,
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get hikes filtered by difficulty level
 */
export const getHikesByDifficulty = async (
  difficultyLevel: "Easy" | "Moderate" | "Difficult" | "Expert"
): Promise<GetUserHikesResponse> => {
  try {
    const allHikes = await getUserHikes();
    const filteredHikes = allHikes.hikes.filter(
      (hike) => hike.difficultyLevel === difficultyLevel
    );
    return {
      count: filteredHikes.length,
      hikes: filteredHikes,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get upcoming hikes (hikes with date >= today)
 */
export const getUpcomingHikes = async (): Promise<GetUserHikesResponse> => {
  try {
    const allHikes = await getUserHikes();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingHikes = allHikes.hikes.filter((hike) => {
      const hikeDate = new Date(hike.hikeDate);
      return hikeDate >= today;
    });

    return {
      count: upcomingHikes.length,
      hikes: upcomingHikes,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get past hikes (hikes with date < today)
 */
export const getPastHikes = async (): Promise<GetUserHikesResponse> => {
  try {
    const allHikes = await getUserHikes();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastHikes = allHikes.hikes.filter((hike) => {
      const hikeDate = new Date(hike.hikeDate);
      return hikeDate < today;
    });

    return {
      count: pastHikes.length,
      hikes: pastHikes,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get hike statistics for the user
 */
export const getHikeStatistics = async (): Promise<{
  totalHikes: number;
  totalDistance: number;
  averageDistance: number;
  difficultyBreakdown: {
    Easy: number;
    Moderate: number;
    Difficult: number;
    Expert: number;
  };
  upcomingCount: number;
  pastCount: number;
}> => {
  try {
    const allHikes = await getUserHikes();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDistance = allHikes.hikes.reduce(
      (sum, hike) => sum + hike.length,
      0
    );

    const difficultyBreakdown = {
      Easy: 0,
      Moderate: 0,
      Difficult: 0,
      Expert: 0,
    };

    let upcomingCount = 0;
    let pastCount = 0;

    allHikes.hikes.forEach((hike) => {
      // Count by difficulty
      difficultyBreakdown[hike.difficultyLevel]++;

      // Count upcoming vs past
      const hikeDate = new Date(hike.hikeDate);
      if (hikeDate >= today) {
        upcomingCount++;
      } else {
        pastCount++;
      }
    });

    return {
      totalHikes: allHikes.count,
      totalDistance,
      averageDistance:
        allHikes.count > 0 ? totalDistance / allHikes.count : 0,
      difficultyBreakdown,
      upcomingCount,
      pastCount,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get ALL hikes from ALL users (community hikes)
 */
export const getAllHikes = async (
  filters?: GetAllHikesRequest
): Promise<GetAllHikesResponse> => {
  try {
    const response = await client.get<GetAllHikesResponse>("/hikes/all", {
      params: filters,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};


export const searchAllHikesByName = async (
  name: string
): Promise<SearchHikesResponse> => {
  try {
    const response = await client.get<SearchHikesResponse>(
      "/hikes/search/all/name",
      {
        params: { name },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
