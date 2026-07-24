#  Smart Iguana Detection System App


<h3 align="center">
Detect, Deter, and DESTROY Iguanas
</h3>

<p align="center">
A mobile application for monitoring and controlling an AI-powered automated iguana detection and trapping system.
</p>

---

#  Project Overview

The **Smart Iguana Detection System App** is a mobile application developed as part of a senior design project at **Florida Atlantic University**. The application provides a user-friendly interface for remotely monitoring an automated iguana detection and trapping system.

The system combines **artificial intelligence, computer vision, embedded systems, and mobile technology** to detect invasive iguanas and assist with population control.

The mobile application communicates with a Raspberry Pi-based detection system that uses a camera, sensors, and a YOLO object detection model to identify iguanas. When an iguana is detected, the system records the event, activates the trap mechanism, and sends updates to the mobile application.

---

#  Project Goals

The goal of this project is to create an automated solution capable of:

- Detecting invasive iguanas using artificial intelligence
- Reducing manual monitoring requirements
- Providing remote system monitoring
- Automating trap activation
- Recording detection events
- Improving response time and accuracy

---

#  Application Features

##  Live Camera Feed

The application allows users to remotely monitor the detection area through a live camera stream.

Features:

- Real-time video monitoring
- Remote access to the Raspberry Pi camera
- Visual confirmation of detected animals
- Simple mobile viewing interface

---

##  AI Detection Monitoring

The application displays information from the computer vision detection system.

Features:

- YOLO-based object detection results
- Iguana detection status
- Confidence score monitoring
- Real-time detection updates

---

##  Trap Monitoring

Users can monitor the automated trap system.

Trap states include:

- Ready
- Detecting
- Iguana Found
- Trap Activated
- Resetting
- Cooldown

---

##  Notifications

The application receives detection updates from the backend system.

Users can view:

- Iguana detection alerts
- Trap activation events
- System activity logs
- Previous detection history

---

##  Detection History

The application stores system events for future review.

Users can:

- View previous detections
- Review timestamps
- Monitor system performance
- Track trap activity

---

#  System Architecture

The application is part of a larger IoT-based detection system.

```
                 Mobile Application
                        |
                        |
                Cloudflare Tunnel
                        |
                        |
                  Raspberry Pi
                        |
        --------------------------------
        |              |               |
     Camera        Sensors        Trap System
        |              |               |
        |
   YOLOv8 AI Model
        |
 Iguana Detection
        |
 Firebase Firestore
```

---

#  Technologies Used

## Mobile Development

- React Native
- Expo
- JavaScript
- Firebase SDK

## Artificial Intelligence

- YOLOv8 Object Detection
- OpenCV
- Python
- Machine Learning Classification

## Cloud Services

- Firebase Firestore
- Cloudflare Tunnel

## Embedded Hardware

- Raspberry Pi 4
- Raspberry Pi Camera Module
- HC-SR04 Ultrasonic Sensor
- Servo Motor
- Stepper Motor
- Motor Drivers

---

#  System Workflow

1. The ultrasonic sensor detects movement near the trap.
2. The Raspberry Pi activates the camera.
3. The camera captures an image.
4. YOLOv8 processes the image.
5. The AI model determines if an iguana is present.
6. If an iguana is detected:
   - The trap mechanism activates.
   - The event is stored in Firebase.
   - A notification is sent to the mobile application.
7. The user can monitor the event through the app.

---

#  Installation

## Requirements

Before installing, make sure you have:

- Node.js installed
- npm installed
- Expo CLI installed
- Android Studio or Xcode (optional)

---

## Clone Repository

```bash
git clone https://github.com/gnembhard/Smart-Iguana-Detection-System-App.git
```

Navigate into the project folder:

```bash
cd Smart-Iguana-Detection-System-App
```

Install dependencies:

```bash
npm install
```

---

#  Running the Application

Start the Expo development server:

```bash
npx expo start
```

Run on:

- Android Emulator
- iOS Simulator
- Physical device using Expo Go

---

# Firebase Configuration

The application uses Firebase Firestore for storing detection information.

Required Firebase services:

- Firestore Database
- Firebase SDK
- Project Configuration

Add your Firebase configuration file before running the application.

Example:

```
firebase/
│
└── firebaseConfig.js
```

---

# System Performance

## AI Detection Performance

| Metric | Result |
|---|---|
| Detection Model | YOLOv8 Nano |
| Confidence Threshold | 70% |
| Daylight Accuracy | ~94% |
| Low-Light Accuracy | ~62-70% |
| YOLO Inference Time | 80-140 ms |
| Total Response Time | 0.65-0.95 seconds |


# Academic Information

**Project:** Detect, Deter, and DESTROY Iguanas

**Course:** Engineering Design 1 & 2

**Institution:** Florida Atlantic University  

---

# License

This project was developed for educational and research purposes as part of the Florida Atlantic University Senior Design Program.
