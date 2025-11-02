import client from "../clients";

// ============ INTERFACES ============

export interface Observation {
  observationId: number;
  hikeId: number;
  userId: number;
  observation: string;
  observationTime: string;
  comments?: string | null;
  observationType?:
    | "Wildlife"
    | "Vegetation"
    | "Weather"
    | "Trail Condition"
    | "Other"
    | null;
  photoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  username?: string;
  userAvatar?: string | null;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateObservationRequest {
  observation: string;
  observationTime?: string;
  comments?: string;
  observationType?: "Wildlife" | "Vegetation" | "Weather" | "Trail Condition" | "Other";
  latitude?: number;
  longitude?: number;
  photo?: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface CreateObservationResponse {
  message: string;
  observationId: number;
  observation: {
    observationId: number;
    hikeId: number;
    userId: number;
    observation: string;
    observationTime: string;
    photoUrl?: string | null;
  };
}

export interface UpdateObservationRequest {
  observation?: string;
  observationTime?: string;
  comments?: string;
  observationType?: "Wildlife" | "Vegetation" | "Weather" | "Trail Condition" | "Other";
  latitude?: number;
  longitude?: number;
  photo?: {
    uri: string;
    type: string;
    name: string;
  } | null;
}

export interface UpdateObservationResponse {
  message: string;
}

export interface DeleteObservationResponse {
  message: string;
}

export interface GetObservationsByHikeResponse {
  count: number;
  observations: Observation[];
}

export interface GetObservationByIdResponse extends Observation {}

export interface ObservationErrorResponse {
  error?: string;
  errors?: {
    field: string;
    msg: string;
  }[];
}

// ============ API FUNCTIONS ============

/**
 * Create a new observation for a hike
 * Anyone can add observations to any hike
 */
export const createObservation = async (
  hikeId: number,
  data: CreateObservationRequest
): Promise<CreateObservationResponse> => {
  try {
    const formData = new FormData();

    formData.append("observation", data.observation);

    if (data.observationTime) formData.append("observationTime", data.observationTime);
    if (data.comments) formData.append("comments", data.comments);
    if (data.observationType) formData.append("observationType", data.observationType);
    if (data.latitude !== undefined) formData.append("latitude", data.latitude.toString());
    if (data.longitude !== undefined) formData.append("longitude", data.longitude.toString());

    if (data.photo) {
      console.log("📸 Adding photo to FormData:", data.photo);
      formData.append("photo", {
        uri: data.photo.uri,
        type: data.photo.type,
        name: data.photo.name,
      } as any);
    }

    console.log("🚀 Sending create observation request...");

    const response = await client.post<CreateObservationResponse>(
      `/hikes/${hikeId}/observations`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ Create observation successful!");
    return response.data;
  } catch (error: any) {
    console.error("❌ Create observation error:", error);
    throw error;
  }
};


/**
 * Get all observations for a specific hike
 */
export const getObservationsByHike = async (
  hikeId: number
): Promise<GetObservationsByHikeResponse> => {
  try {
    const response = await client.get<GetObservationsByHikeResponse>(
      `/hikes/${hikeId}/observations`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get a specific observation by ID
 */
export const getObservationById = async (
  observationId: number
): Promise<GetObservationByIdResponse> => {
  try {
    const response = await client.get<GetObservationByIdResponse>(
      `/hikes/observations/${observationId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update an observation
 * Only the observation creator can update
 */
export const updateObservation = async (
  observationId: number,
  data: UpdateObservationRequest
): Promise<UpdateObservationResponse> => {
  try {
    const formData = new FormData();

    if (data.observation !== undefined) formData.append("observation", data.observation);
    if (data.observationTime !== undefined) formData.append("observationTime", data.observationTime);
    if (data.comments !== undefined) formData.append("comments", data.comments);
    if (data.observationType !== undefined) formData.append("observationType", data.observationType);
    if (data.latitude !== undefined) formData.append("latitude", data.latitude.toString());
    if (data.longitude !== undefined) formData.append("longitude", data.longitude.toString());

    if (data.photo !== undefined) {
      if (data.photo === null) {
        formData.append("deletePhoto", "true");
        console.log("🗑️ Marking photo for deletion");
      } else {
        console.log("📸 Updating photo:", data.photo);
        formData.append("photo", {
          uri: data.photo.uri,
          type: data.photo.type,
          name: data.photo.name,
        } as any);
      }
    }

    console.log("🚀 Sending update request for observation:", observationId);

    const response = await client.put<UpdateObservationResponse>(
      `/hikes/observations/${observationId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ Update observation successful!");
    return response.data;
  } catch (error: any) {
    console.error("❌ Update observation error:", error);
    throw error;
  }
};


/**
 * Delete an observation
 */
export const deleteObservation = async (
  observationId: number
): Promise<DeleteObservationResponse> => {
  try {
    const response = await client.delete<DeleteObservationResponse>(
      `/hikes/observations/${observationId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get observations by type for a specific hike
 */
export const getObservationsByType = async (
  hikeId: number,
  observationType: "Wildlife" | "Vegetation" | "Weather" | "Trail Condition" | "Other"
): Promise<GetObservationsByHikeResponse> => {
  try {
    const allObservations = await getObservationsByHike(hikeId);
    const filteredObservations = allObservations.observations.filter(
      (obs) => obs.observationType === observationType
    );

    return {
      count: filteredObservations.length,
      observations: filteredObservations,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get observations with photos only
 */
export const getObservationsWithPhotos = async (
  hikeId: number
): Promise<GetObservationsByHikeResponse> => {
  try {
    const allObservations = await getObservationsByHike(hikeId);
    const filteredObservations = allObservations.observations.filter(
      (obs) => obs.photoUrl && obs.photoUrl !== null
    );

    return {
      count: filteredObservations.length,
      observations: filteredObservations,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get observations with location data
 */
export const getObservationsWithLocation = async (
  hikeId: number
): Promise<GetObservationsByHikeResponse> => {
  try {
    const allObservations = await getObservationsByHike(hikeId);
    const filteredObservations = allObservations.observations.filter(
      (obs) =>
        obs.latitude !== null &&
        obs.latitude !== undefined &&
        obs.longitude !== null &&
        obs.longitude !== undefined
    );

    return {
      count: filteredObservations.length,
      observations: filteredObservations,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get observation statistics for a hike
 */
export const getObservationStatistics = async (
  hikeId: number
): Promise<{
  totalObservations: number;
  withPhotos: number;
  withLocation: number;
  typeBreakdown: {
    Wildlife: number;
    Vegetation: number;
    Weather: number;
    "Trail Condition": number;
    Other: number;
    Unspecified: number;
  };
}> => {
  try {
    const allObservations = await getObservationsByHike(hikeId);

    const withPhotos = allObservations.observations.filter(
      (obs) => obs.photoUrl && obs.photoUrl !== null
    ).length;

    const withLocation = allObservations.observations.filter(
      (obs) =>
        obs.latitude !== null &&
        obs.latitude !== undefined &&
        obs.longitude !== null &&
        obs.longitude !== undefined
    ).length;

    const typeBreakdown = {
      Wildlife: 0,
      Vegetation: 0,
      Weather: 0,
      "Trail Condition": 0,
      Other: 0,
      Unspecified: 0,
    };

    allObservations.observations.forEach((obs) => {
      if (obs.observationType) {
        typeBreakdown[obs.observationType]++;
      } else {
        typeBreakdown.Unspecified++;
      }
    });

    return {
      totalObservations: allObservations.count,
      withPhotos,
      withLocation,
      typeBreakdown,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get user's own observations across all hikes
 */
export const getUserObservations = async (
  userId: number,
  allHikes: number[]
): Promise<Observation[]> => {
  try {
    const allObservations: Observation[] = [];

    for (const hikeId of allHikes) {
      const hikeObservations = await getObservationsByHike(hikeId);
      const userObservations = hikeObservations.observations.filter(
        (obs) => obs.userId === userId
      );
      allObservations.push(...userObservations);
    }

    return allObservations;
  } catch (error: any) {
    throw error;
  }
};