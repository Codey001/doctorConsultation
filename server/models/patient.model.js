import mongoose from "mongoose";
import {encrypt, decrypt} from '../config/encryption.js';


const patientSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        default: "",
    },
  
    //ENCRYPTED HEALTH INFORMATION
    healthInfo: {
      pastMedicalConditions: {
        default: "",
        type: String, 
        set: encrypt,
        get: decrypt
      },
      currentMedications: {
        default: "",

        type: String, 
        set: encrypt,
        get: decrypt
      },
      allergies: {
        default: "",

        type: String,
        set: encrypt,
        get: decrypt
      },
      familyMedicalHistory: {
        default: "",

        type: String, 
        set: encrypt,
        get: decrypt
      }
    },
  
    createdAt: {
        type: Date,
        default: Date.now,
    },
  });

   
  const Patient = mongoose.model("Patient", patientSchema);
  export default Patient;