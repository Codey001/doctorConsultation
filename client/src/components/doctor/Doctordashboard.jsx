// import { Box, Typography, Divider } from "@mui/material";
// import PropTypes from "prop-types";
// import PendingAppointments from "./appointments/Pendingappointments";
// import ConfirmedAppointments from "./appointments/Confirmedappointments";
// import CompletedAppointments from "./appointments/Completedappointments";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// const DoctorDashboard = () => {
//   // const doctorId = useSelector((state) => state.userData?._id)
//   // const [consultationList, setConsultationList] = useState([]);

//   // useEffect(() => {
//   // //FETCH ALL DOCTOR CONSULTATIONS

//   //     async function fetchDoctorConsultations(){
//   //         try {
//   //             const response = await fetch('http://localhost:8080/api/consultation/doctor/allConsultations', {
//   //                 method: 'PATCH',
//   //                 headers: {
//   //                     'Content-Type': 'application/json',
//   //                 },
//   //                 body: JSON.stringify({ type:"Doctor", doctorId: doctorId}),
//   //             });

//   //             if (!response.ok) {
//   //                 throw new Error('Network response was not ok');
//   //             }

//   //             const data = await response.json();

//   //             console.log(data)
//   //         } catch (error) {

//   //         }
//   //     }

//   // fetchDoctorConsultations();

//   // }, [])

//   //FETCH WAITING PATIENTS

//   return (
//     <div>
//       <Typography variant="h3" gutterBottom>
//         Doctor Dashboard
//       </Typography>

//       {/* Pending Appointments Section */}
//       <Box mb={4}>
//         <PendingAppointments
//           doctorId={doctorId}
//           doctorSpecialty={doctorSpecialty}
//         />
//       </Box>

//       <Divider />

//       {/* Confirmed Appointments Section */}
//       <Box mb={4}>
//         <ConfirmedAppointments doctorId={doctorId} />
//       </Box>

//       <Divider />

//       {/* Completed Appointments Section */}
//       <Box mb={4}>
//         <CompletedAppointments doctorId={doctorId} />
//       </Box>
//     </div>
//   );
// };

// export default DoctorDashboard;




// import { useState, useEffect } from "react";
// import {
//   Typography,
//   Box,
//   List,
//   ListItem,
//   ListItemText,
//   Button,
//   Divider,
// } from "@mui/material";
// import { format } from "date-fns";
// // import PatientConsultationModal from "./Patientconsultationmodal";
// import PatientConsultationModal from "../patient/Patientconsultationmodal"
// import PropTypes from "prop-types";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';

// export default function DoctorDashboard() {
//   const [selectedConsultation, setSelectedConsultation] = useState(null);
//   const [consultations, setConsultations] = useState([]);
//   const type = useSelector((state) => state.userData?.type);
//   const id = useSelector((state) => state.userData?._id);

//     const [pendingConsultations, setPendingConsultations] = useState([])

//   const navigate = useNavigate();


//   useEffect(() => {
//     const fetchConsultations = async () => {
//       try {
//         const response = await axios.post(
//           "http://localhost:8080/api/consultation/doctor/allConsultations",
//           {
//             type: type,
//             doctorId: id,
//           }
//         );

//         console.log(response.data);

//         setConsultations(response.data);
//       } catch (error) {
//         console.error("Error fetching consultations:", error);
//       }
//     };

//     fetchConsultations();
//   }, []);

//   useEffect(() => {
//     const fetchUnattendedPatients = async () => {
//       try {
//         const response = await axios.post(
//           "http://localhost:8080/api/consultation/doctor/allPatients",
//           {
//             type: type,
//             doctorId: id,
//           }
//         );

//         console.log(response.data);

//         setPendingConsultations(response.data);
//       } catch (error) {
//         console.error("Error fetching consultations:", error);
//       }
//     };

//     fetchUnattendedPatients();
//   }, []);

//   async function joinMeeting(consultationId){
//     //make request
//     try {

//       const response = await fetch('http://localhost:8080/api/consultation/joinMeeting', {
//         method: 'PATCH',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ userId:id, consultationId:consultationId }),
//     });

//     if (!response.ok) {
//         throw new Error('Network response was not ok');
//     }

//     const data = await response.json();

//     console.log(data)

//     const meetingLink = data.roomInfo;
//     console.log(meetingLink)
//     //redirect with url

//     navigate('/meeting', { state: { meetingUrl: meetingLink } });



//     } catch (error) {
//         console.error('Error joining meeting:', error);
//     }
//   }

//   async function acceptConsultation(consultationId){

//     try {

//       const response = await fetch('http://localhost:8080/api/consultation/assignDoctor', {
//         method: 'PATCH',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ doctorId:id, consultationId:consultationId }),
//     });

//     navigate("/");

//     } catch (error) {
//         console.error('Error joining meeting:', error);
//     }

//   }






//   const ConsultationList = ({ consultations, onOpenModal, type: status }) => (
//     <List>
//       {consultations.map((consultation) => (
//         <ListItem key={consultation._id} divider>
//           <ListItemText
//             primary={`${consultation.specialty}`}
//             secondary={format(new Date(consultation.timestamp), "PPpp")}
//           />
//           <Button variant="outlined" onClick={() => onOpenModal(consultation)}>
//             View Details
//           </Button>
//           {status == "Confirmed" ? (
//             <Button
//               variant="outlined"
//               onClick={() => joinMeeting(consultation._id)}
//             >
//               Join
//             </Button>
//           ) : null}

//           {(status == "Pending" && type=="Doctor") ? (
//             <Button
//               variant="outlined"
//               onClick={() => acceptConsultation(consultation._id)}
//             >
//               Accept
//             </Button>
//           ) : null}


//         </ListItem>
//       ))}
//     </List>
//   );
//   ConsultationList.propTypes = {
//     consultations: PropTypes.array.isRequired,
//     onOpenModal: PropTypes.func.isRequired,
//   };

//   const handleOpenModal = (consultation) => {
//     setSelectedConsultation(consultation);
//   };

//   const handleCloseModal = () => {
//     setSelectedConsultation(null);
//   };

//   // const pendingConsultations = consultations.filter(
//   //   (c) => c.status === "Pending"
//   // );
//   const confirmedConsultations = consultations.filter(
//     (c) => c.status === "Confirmed"
//   );
//   const completedConsultations = consultations.filter(
//     (c) => c.status === "Completed"
//   );

//   return (
//     <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         Your Consultations
//       </Typography>

//       <Typography variant="h5" gutterBottom>
//         Confirmed Consultations
//       </Typography>
//       {confirmedConsultations.length > 0 ? (
//         <ConsultationList
//           type="Confirmed"
//           consultations={confirmedConsultations}
//           onOpenModal={handleOpenModal}
//         />
//       ) : (
//         <Typography>No confirmed consultations.</Typography>
//       )}
//       <Divider sx={{ my: 3 }} />

//       <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
//         Pending Consultations
//       </Typography>
//       {pendingConsultations.length > 0 ? (
//         <ConsultationList
//           type="Pending"
//           consultations={pendingConsultations}
//           onOpenModal={handleOpenModal}
//         />
//       ) : (
//         <Typography>No pending consultations.</Typography>
//       )}

//       <Divider sx={{ my: 3 }} />

//       <Typography variant="h5" gutterBottom>
//         Completed Consultations
//       </Typography>
//       {completedConsultations.length > 0 ? (
//         <ConsultationList
//           type="Completed"
//           consultations={completedConsultations}
//           onOpenModal={handleOpenModal}
//         />
//       ) : (
//         <Typography>No completed consultations.</Typography>
//       )}

//       {selectedConsultation && (
//         <PatientConsultationModal
//           open={Boolean(selectedConsultation)}
//           onClose={handleCloseModal}
//           consultation={selectedConsultation}
//         />
//       )}
//     </Box>
//   );
// }




import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from "@mui/material";
import { format } from "date-fns";
import PatientConsultationModal from "../patient/Patientconsultationmodal";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const type = useSelector((state) => state.userData?.type);
  const id = useSelector((state) => state.userData?._id);
  const [pendingConsultations, setPendingConsultations] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/consultation/doctor/allConsultations",
          {
            type: type,
            doctorId: id,
          }
        );
        setConsultations(response.data);
      } catch (error) {
        console.error("Error fetching consultations:", error);
      }
    };

    fetchConsultations();
  }, [type, id]);

  useEffect(() => {
    const fetchUnattendedPatients = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

        const response = await axios.post(
          `${apiUrl}/api/consultation/doctor/allPatients`,
          {
            type: type,
            doctorId: id,
          }
        );
        setPendingConsultations(response.data);
      } catch (error) {
        console.error("Error fetching unattended patients:", error);
      }
    };

    fetchUnattendedPatients();
  }, [type, id]);

  async function joinMeeting(consultationId) {
    try {
      const response = await fetch('http://localhost:8080/api/consultation/joinMeeting', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: id, consultationId: consultationId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const meetingLink = data.roomInfo;
      navigate('/meeting', { state: { meetingUrl: meetingLink } });
    } catch (error) {
      console.error('Error joining meeting:', error);
    }
  }

  async function acceptConsultation(consultationId) {
    try {
      const response = await fetch('http://localhost:8080/api/consultation/assignDoctor', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doctorId: id, consultationId: consultationId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      navigate("/");
    } catch (error) {
      console.error('Error accepting consultation:', error);
    }
  }

  const ConsultationList = ({ consultations, onOpenModal, type: status }) => (
    <List>
      {consultations.map((consultation) => (
        <ListItem key={consultation._id} divider>
          <ListItemText
            primary={`${consultation.specialty}`}
            secondary={format(new Date(consultation.timestamp), "PPpp")}
          />
          <Button variant="outlined" onClick={() => onOpenModal(consultation)} sx={{ mr: 1 }}>
            View Details
          </Button>
          {status === "Confirmed" ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => joinMeeting(consultation._id)}
              sx={{ mr: 1 }}
            >
              Join
            </Button>
          ) : null}

          {(status === "Pending" && type === "Doctor") ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => acceptConsultation(consultation._id)}
            >
              Accept
            </Button>
          ) : null}
        </ListItem>
      ))}
    </List>
  );

  ConsultationList.propTypes = {
    consultations: PropTypes.array.isRequired,
    onOpenModal: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
  };

  const handleOpenModal = (consultation) => {
    setSelectedConsultation(consultation);
  };

  const handleCloseModal = () => {
    setSelectedConsultation(null);
  };

  const confirmedConsultations = consultations.filter(
    (c) => c.status === "Confirmed"
  );
  const completedConsultations = consultations.filter(
    (c) => c.status === "Completed"
  );

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", mt: 4, p: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0D47A1' }}>
        Your Consultations
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ color: '#1E88E5' }}>
        Confirmed Consultations
      </Typography>
      {confirmedConsultations.length > 0 ? (
        <ConsultationList
          type="Confirmed"
          consultations={confirmedConsultations}
          onOpenModal={handleOpenModal}
        />
      ) : (
        <Typography>No confirmed consultations.</Typography>
      )}
      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom sx={{ color: '#1E88E5' }}>
        Pending Consultations
      </Typography>
      {pendingConsultations.length > 0 ? (
        <ConsultationList
          type="Pending"
          consultations={pendingConsultations}
          onOpenModal={handleOpenModal}
        />
      ) : (
        <Typography>No pending consultations.</Typography>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom sx={{ color: '#1E88E5' }}>
        Completed Consultations
      </Typography>
      {completedConsultations.length > 0 ? (
        <ConsultationList
          type="Completed"
          consultations={completedConsultations}
          onOpenModal={handleOpenModal}
        />
      ) : (
        <Typography>No completed consultations.</Typography>
      )}

      {selectedConsultation && (
        <PatientConsultationModal
          open={Boolean(selectedConsultation)}
          onClose={handleCloseModal}
          consultation={selectedConsultation}
        />
      )}
    </Box>
  );
}
