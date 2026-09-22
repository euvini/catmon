import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

export interface PermissionStatus {
  camera: boolean;
  location: boolean;
}

export const PermissionsService = {
  async getStatus(): Promise<PermissionStatus> {
    try {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      const locationStatus = await Location.getForegroundPermissionsAsync();

      return {
        camera: cameraStatus.granted,
        location: locationStatus.granted,
      };
    } catch {
      return { camera: false, location: false };
    }
  },

  async requestCamera(): Promise<boolean> {
    try {
      const response = await Camera.requestCameraPermissionsAsync();
      return response.granted;
    } catch {
      return false;
    }
  },

  async requestLocation(): Promise<boolean> {
    try {
      const response = await Location.requestForegroundPermissionsAsync();
      return response.granted;
    } catch {
      return false;
    }
  },

  async requestAll(): Promise<PermissionStatus> {
    const camera = await this.requestCamera();
    const location = await this.requestLocation();
    return { camera, location };
  },
};
