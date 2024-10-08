import Consultation from "../models/consultation.model.js";
import axios from 'axios';
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";

const DAILY_TOKEN = process.env.ROOM_TOKEN;

//HELPER FUNCTION TO CREATE NEW ROOM LINK
async function createRoomAPI() {
    const baseUrl = process.env.DAILY_ROOM_API;

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DAILY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
  
                "properties": {
                  "start_audio_off": true,
                "enable_chat": true,
                  "start_video_off": true
                }
              }
              )
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error making POST request:', error.message);
        throw new Error('Failed to make POST request');
    }
}

//HELPER FUNCTION TO DELETE AN EXISTING ROOM
async function deleteRoomAPI(roomUrl) {
    try {
        const url = roomUrl; // Construct the URL with the room ID
        
        const response = await axios.delete(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DAILY_TOKEN}` // Set the Bearer token in the Authorization header
            }
        });
        
        console.log('Room deleted successfully:'); // Log the response from the API
    } catch (error) {
        console.error('Error deleting room:', error.message); // Handle errors
    }
}


//CREATE A NEW CONSULTATION WHEN THE PATIENT INITALLY MAKE THE PAYMENT
async function createConsultation(patientId, time, symptoms, transactionId, specialty) {
    try {
        const newConsultation = new Consultation({
            patient: patientId,
            timestamp: time,
            symptoms: symptoms,
            transactionId: transactionId,
            specialty: specialty
        });
        
        await newConsultation.save();
        
        return newConsultation; 
    } catch (error) {
        console.error("Error creating consultation:", error.message); 
        throw new Error("Failed to create consultation"); 
    }
}

//WHEN THE DOCTOR ACCEPTS THE CONSULATAION THE DOCTOR IS ASSIGNED TO IT
async function assignDoctor(req,res){
    try {
        const {consultationId, doctorId} = req.body; 
        console.log([consultationId, doctorId]);

        let consultation = await Consultation.findById({_id: consultationId})
        if(!consultation){
            return res.status(404).json({message: "Consultation not found"});
        }

        consultation.doctor = doctorId; 
        consultation.status = "Confirmed";

        await consultation.save();

        return res.status(200).json(consultation); // Return the updated consultation

    } catch (error) {
        console.error("Error assigning doctor:", error.message); // Log the error for debugging
        throw new Error("Failed to assign doctor"); // Throw a meaningful error
    }
}

//BEFORE 10 MIN THE PATIENT OR THE DOCTOR CAN CREATE THE CONSULATION LINK
async function joinMeeting(req,res){

    try {
        const {userId, consultationId} = req.body;
        console.log([userId, consultationId]);
        
        let consultation = await Consultation.findOne({_id: consultationId});
        if(!consultation){
            return res.status(404).json({message: "Consultation not found"});
        }

        if(userId == consultation.patient || userId==consultation.doctor){
            //CREATE ROOM

            //check if the meeting exists already
            if(consultation.meetingRoomUrl != ""){
                return res.status(200).json({message: "Meeting already exists", roomInfo: consultation.meetingRoomUrl})
            }

            try {
                const roomInfo = await createRoomAPI();
                console.log("room created", roomInfo)
                consultation.meetingRoomUrl = roomInfo.url;
                await consultation.save();
                res.status(200).json({message: "Room successfully created", roomInfo: roomInfo.url})

            } catch (error) {
                console.log("Error creating room:", error.message);
                res.status(400).json({message: "Error creating room"});
            }

        }else{
            return res.status(403).json({message: "User is not authorized to create a room"});
        }
        
    } catch (error) {
        console.error("Error creating room:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

// AFTER COMPLETING THE CONSULTATION THE DOCTOR CAN UPDATE THE PRESCRIPTION DETAILS FOR THAT PATIENT
async function updateConsultationDetails(req,res){
    try {
        const {doctorId, consultationId, diagnosis, prescription} = req.body;
        
        const consultation = await Consultation.findById({_id: consultationId});

        if(!consultation){
            return res.status(404).json({message: "Consultation not found"});
        }

        //check authorized doctor
        if(consultation.doctor != doctorId){
            return res.status(403).json({message: "User is not authorized to update consultation details"});
        }

        consultation.status = "Completed";
        consultation.diagnosis = diagnosis;
        consultation.prescription = prescription;
        await consultation.save();


        //delete room
        try {
            const roomDeleted = await deleteRoomAPI(consultation.meetingRoomUrl);
            return res.status(200).json(consultation)
            
        } catch (error) {
            console.log("Error deleting room:", error.message);
            res.status(400).json({message: "Error deleting room"});
        }

    } catch (error) {
        console.error("Error creating room:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

//GET ALL THE CONSULTATIONS FOR A PATIENT
async function patientConsultations(req,res){
    try {
        const {type, patientId} = req.body;

        if(type != "Patient"){
            return res.status(403).json({message: "User is not authorized to view consultations"});
        }
        
        const consultations = await Consultation.find({patient: patientId});
        
        if(!consultations){
            return res.status(404).json({message: "No consultations found"});
        }

        console.log(consultations)

        //send all the consultaions
        res.status(200).json(consultations); // Return the updated consultation

    } catch (error) {
        console.error("Error creating room:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

//GET ALL THE CONSULTATIONS FOR A DOCTOR
async function doctorConsultations(req,res){
    try {
        const {type, doctorId} = req.body;
        
        if(type!= "Doctor"){
            return res.status(403).json({message: "User is not authorized to view consultations"});
        }

        const consultations = await Consultation.find({doctor: doctorId});
        
        if(!consultations){
            return res.status(404).json({message: "No consultations found"});
        }

        res.status(200).json(consultations); // Return the updated consultation
        
    } catch (error) {
        console.error("Error updaing consultation:", error.message);
        res.status(500).json({message: "Internal server error"});        
    }
}

//GET DETAILS OF A PARTICULAR CONSULTATION
async function consultationDetails(req,res){
    try {
        const {doctorId, patientId, consultationId} = req.body;
        console.log([doctorId, patientId, consultationId])

        const consultation = await Consultation.findById({_id:consultationId});

        if(!consultation){
            return res.status(404).json({message: "No consultations found"});
        }

        if(consultation.patient == patientId || consultation.doctor == doctorId){

            let doctorDetail = null;
            let patientDetail = null;

            if(doctorId) doctorDetail = await Doctor.findOne({_id:doctorId});
            if(patientId) patientDetail = await Patient.findOne({_id: patientId});

 
            console.log([doctorDetail, patientDetail])



            res.status(200).json({doctorName:doctorDetail?.name, patientName:patientDetail?.name, symptoms:consultation.symptoms, diagnosis: consultation.diagnosis, prescription:consultation.prescription, status: consultation.status, specialty: consultation.specialty})
        }else{
            return res.status(403).json({message: "User is not authorized to access consultation details"});   
        }

    } catch (error) {
        console.error("Error fetching details:", error.message);
        res.status(500).json({message: "Internal server error"});   
    }
}

//PATIENT CAN RESCHEDULE THE CONSULTATION
async function rescheduleConsultation(req,res){
    try {
        const {patientId,updatedTime, consultationId} = req.body;

        const consultation = await Consultation.findById({_id: consultationId});
        
        if(!consultation){
            return res.status(404).json({message: "No consultations found"});
        }

        if(consultation.patient != patientId){
            return res.status(403).json({message: "User is not authorized to reschedule consultation"});
        }

        consultation.timestamp = updatedTime;
        await consultation.save();

        res.status(200).json({message: "Consultation rescheduled successfully", consultation: consultation})

    } catch (error) {
        console.error("Error rescheduling consultation:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

//SHOW THE LIST OF NOT ATTENDED PATIENT YET FOR A SPECIFIC DOCTOR
async function pendingPatients(req,res){   
    try {
        const {type, doctorId} = req.body;
        
        if(type!= "Doctor"){
            return res.status(403).json({message: "User is not authorized to view consultations"});
        }

        const doctorDetails = await Doctor.findById({_id : doctorId})
        
        if(!doctorDetails){
            return res.status(404).json({message: "Doctor not found"});
        }

        const specialty = doctorDetails.specialization;

        const pendingConsultations = await Consultation.find({specialty: specialty, status: "Pending"});


        res.status(200).json(pendingConsultations)

    } catch (error) {
        console.error("Error fetching pending patients:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export {createConsultation,updateConsultationDetails,joinMeeting,assignDoctor, patientConsultations,doctorConsultations, consultationDetails, rescheduleConsultation,pendingPatients}