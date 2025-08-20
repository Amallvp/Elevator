🚀 IoT Elevator Backend — Installation Guide

This project is a Node.js + MongoDB backend for a fully managed IoT Elevator system.
It provides REST APIs, WebSocket/MQTT integration, and MongoDB persistence for elevator monitoring & control.


📂 Clone the Repository
git clone https://github.com/Amallvp/Elevator.git
cd Elevator


⚙️ Environment Configuration

Create a .env file in the project root:

# Server
PORT=
# Database
MONGO_URI=
# JWT / Auth (if enabled)
JWT_SECRET=

📦 Install Dependencies

npm install
nodemon server.js
