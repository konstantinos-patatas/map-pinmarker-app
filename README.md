
# 🚗 Community-Driven Parking Finder Web App

**Find the Live version of this website:** [https://parknfree.com](https://parknfree.com)

ParknFree is a community-driven web application that helps users find and share free parking spots in their city. Built with React and Firebase, it allows users to pin locations, view others' contributions, and favorite commonly used spots. The app is optimized for quick deployment and ease of use, and was developed and launched in just one week.

---

## 🔑 Key Features & Technologies

### 🌐 Frontend
- **React + Vite**: Lightweight setup for rapid development.
- **Leaflet + OpenStreetMap + Esri**: Custom interactive maps with both street and satellite views.
- **User Geolocation**: Uses the Geolocation API and IP fallback (via ipapi.co and myip.com) to improve user location detection and ease of pinning.

### 🔥 Backend (Firebase)
- **Firestore Database**: Stores pins, user profiles, and favorites.
- **Firebase Authentication**: Required for adding pins. Supports Google Sign-In.
- **Real-time Pin Rendering**: Pins update live on the map as they are added.
- **Favorite Pins**: Users can mark and save favorite locations.

---

## ⚡ Outcome

Successfully delivered a full-stack MVP in just one week. The project demonstrates full-stack web development skills, including real-time data handling, authentication, and interactive map integration.

---

## 🛠️ Development Instructions

To run this project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/parknfree.git
   cd parknfree
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Rename the `.env.example` file to `.env`
   - Fill in the required values using your actual **EmailJS** and **Firebase** configuration keys also when adding users get the uid of the admin and add it(2 admins required).

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:5173` in your browser.

---

## 📦 Tech Stack

- React
- Vite
- Firebase (Firestore, Auth, Hosting)
- Leaflet.js
- OpenStreetMap / Esri
- JavaScript (ES6+)
- EmailJS (for contact/report features)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
