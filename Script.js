document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const fileUploadForm = document.getElementById('fileUploadForm');
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');

    // Login form handler
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                // You can redirect or show success message here
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Connection error. Please check if the server is running.');
        }
    });

    // File upload form handler
    fileUploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const files = fileInput.files;
        if (files.length === 0) {
            alert('Please select at least one file to upload');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            uploadStatus.innerHTML = '<p>📤 Uploading files...</p>';
            
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                uploadStatus.innerHTML = `<p style="color: green;">✅ ${data.message}</p>`;
                fileInput.value = ''; // Clear the file input
            } else {
                uploadStatus.innerHTML = `<p style="color: red;">❌ ${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
            uploadStatus.innerHTML = '<p style="color: red;">❌ Upload failed. Please check if the server is running.</p>';
        }
    });
});
  
// ===================== Profile Schema =====================
const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 18, max: 100 },
  dob: String,
  location: String,
  occupation: String,
  hobbies: [String],
  relationshipGoals: String,
  lifestyle: String,
  religion: String,
  height: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  languages: String,
  interestedIn: { type: String, enum: ['male', 'female', 'both'] },
  profileNote: String,
  profilePhoto: String, // This will store the file path or URL
  createdAt: { type: Date, default: Date.now }
});

const Profile = mongoose.model("Profile", profileSchema);

// ===================== Profile Save Route (POST) =====================
app.post("/api/profile", async (req, res) => {
  try {
    // Basic validation
    if (!req.body.name || !req.body.age) {
      return res.json({ 
        success: false, 
        message: "❌ Name and age are required" 
      });
    }

    const newProfile = new Profile(req.body);
    await newProfile.save();
    
    res.json({ 
      success: true, 
      message: "✅ Profile saved successfully!",
      profileId: newProfile._id 
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    
    // Handle duplicate key errors (if any)
    if (error.code === 11000) {
      return res.json({ 
        success: false, 
        message: "❌ Profile already exists" 
      });
    }
    
    res.json({ 
      success: false, 
      message: "❌ Error saving profile" 
    });
  }
});

// ===================== Profile Fetch Route (GET) =====================
app.get("/api/profile", async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 }); // Newest first
    res.json({ success: true, profiles });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.json({ 
      success: false, 
      message: "❌ Error fetching profiles" 
    });
  }
});

// ===================== Get Single Profile by ID =====================
app.get("/api/profile/:id", async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.json({ 
        success: false, 
        message: "❌ Profile not found" 
      });
    }
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.json({ 
      success: false, 
      message: "❌ Error fetching profile" 
    });
  }
});

// ===================== Update Profile Route (PUT) =====================
app.put("/api/profile/:id", async (req, res) => {
  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedProfile) {
      return res.json({ 
        success: false, 
        message: "❌ Profile not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "✅ Profile updated successfully!",
      profile: updatedProfile 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.json({ 
      success: false, 
      message: "❌ Error updating profile" 
    });
  }
});

// ===================== Delete Profile Route (DELETE) =====================
app.delete("/api/profile/:id", async (req, res) => {
  try {
    const deletedProfile = await Profile.findByIdAndDelete(req.params.id);
    
    if (!deletedProfile) {
      return res.json({ 
        success: false, 
        message: "❌ Profile not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "✅ Profile deleted successfully!" 
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.json({ 
      success: false, 
      message: "❌ Error deleting profile" 
    });
  }
});