const SUPABASE_URL = "https://bupwkwpcaoaohzfwleou.supabase.co";
const SUPABASE_KEY = "sb_publishable_EnPl-L86y6pxiW39q01ceQ_sCbhYbJo

const A = document.getElementById("app");

async function sb(path, options = {}) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": options.method === "POST"
        ? "return=representation"
        : "return=minimal",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function e(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function home() {
  A.innerHTML = `
    <div class="wrap">
      <h1>EditConnect</h1>
      <h2>Connect With Professional Editors</h2>
      <p>Find editors, post editing jobs and connect with talented video editors.</p>

      <button onclick="editors()">Find Editors</button>
      <button onclick="jobs()">Latest Editing Jobs</button>
      <button onclick="register()">Join EditConnect</button>
    </div>
  `;
}

async function editors() {
  A.innerHTML = `<div class="wrap"><h2>Professional Editors</h2><p>Loading...</p></div>`;

  try {
    const data = await sb(
      "editors?select=*&order=created_at.desc"
    );

    if (!data.length) {
      A.innerHTML = `
        <div class="wrap">
          <h2>Professional Editors</h2>
          <p>No editors registered yet.</p>
          <button onclick="register()">Join as Editor</button>
        </div>`;
      return;
    }

    A.innerHTML = `
      <div class="wrap">
        <h2>Professional Editors</h2>
        ${data.map(x => `
          <div class="card">
            <h3>${e(x.name)}</h3>
            <p>${e(x.description)}</p>
            <p><b>Skills:</b> ${e(x.skills)}</p>
            <p><b>Experience:</b> ${e(x.experience)}</p>
            <p><b>Location:</b> ${e(x.location)}</p>
            <p><b>Hourly Rate:</b> ₹${e(x.hourly_rate)}</p>
            ${x.is_verified ? "<p>✓ Verified Editor</p>" : ""}
            ${x.portfolio_url ? `<a href="${e(x.portfolio_url)}" target="_blank">View Portfolio</a>` : ""}
          </div>
        `).join("")}
      </div>`;
  } catch (err) {
    A.innerHTML = `<div class="wrap"><h2>Error</h2><p>${e(err.message)}</p></div>`;
  }
}

async function jobs() {
  A.innerHTML = `<div class="wrap"><h2>Latest Editing Jobs</h2><p>Loading...</p></div>`;

  try {
    const data = await sb(
      "jobs?select=*&order=created_at.desc"
    );

    if (!data.length) {
      A.innerHTML = `
        <div class="wrap">
          <h2>Latest Editing Jobs</h2>
          <p>No jobs posted yet.</p>
          <button onclick="post()">Post an Editing Job</button>
        </div>`;
      return;
    }

    A.innerHTML = `
      <div class="wrap">
        <h2>Latest Editing Jobs</h2>

        ${data.map(x => `
          <div class="card">
            <h3>${e(x.title)}</h3>
            <p>${e(x.description)}</p>
            <p><b>Budget:</b> ₹${e(x.budget)}</p>
            <p><b>Client:</b> ${e(x.client_name)}</p>
            <p><b>Status:</b> ${e(x.status)}</p>
            ${x.video_url ? `<p><a href="${e(x.video_url)}" target="_blank">View Video</a></p>` : ""}
            <button onclick="apply(${x.id})">Apply for this Job</button>
          </div>
        `).join("")}

        <button onclick="post()">Post New Job</button>
      </div>`;
  } catch (err) {
    A.innerHTML = `<div class="wrap"><h2>Error</h2><p>${e(err.message)}</p></div>`;
  }
}

function register() {
  A.innerHTML = `
    <div class="wrap">
      <h2>Join EditConnect</h2>

      <input id="name" placeholder="Your Name">
      <input id="email" placeholder="Email">
      <textarea id="description" placeholder="About You"></textarea>
      <input id="skills" placeholder="Editing Skills">
      <input id="experience" placeholder="Experience">
      <input id="location" placeholder="Location">
      <input id="hourly_rate" type="number" placeholder="Hourly Rate">
      <input id="portfolio_url" placeholder="Portfolio URL">
      <input id="raw_video_url" placeholder="Raw Video URL">
      <input id="edited_video_url" placeholder="Edited Video URL">
      <input id="bio" placeholder="Short Bio">
      <input id="phone" placeholder="Phone">

      <button onclick="saveUser()">Register as Editor</button>
    </div>`;
}

async function saveUser() {
  const user = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    description: document.getElementById("description").value,
    skills: document.getElementById("skills").value,
    experience: document.getElementById("experience").value,
    location: document.getElementById("location").value,
    hourly_rate: Number(document.getElementById("hourly_rate").value || 0),
    portfolio_url: document.getElementById("portfolio_url").value,
    raw_video_url: document.getElementById("raw_video_url").value,
    edited_video_url: document.getElementById("edited_video_url").value,
    bio: document.getElementById("bio").value,
    phone: document.getElementById("phone").value
  };

  try {
    const result = await sb("editors", {
      method: "POST",
      body: JSON.stringify(user)
    });

    if (result && result[0]) {
      localStorage.setItem("editconnect_editor_id", result[0].id);
    }

    alert("Editor profile created successfully!");
    editors();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function post() {
  A.innerHTML = `
    <div class="wrap">
      <h2>Post an Editing Job</h2>

      <input id="job_title" placeholder="Job Title">
      <textarea id="job_description" placeholder="Job Description"></textarea>
      <input id="job_budget" type="number" placeholder="Budget">
      <input id="client_name" placeholder="Your Name">
      <input id="video_url" placeholder="Video URL">

      <button onclick="saveJob()">Post Job</button>
    </div>`;
}

async function saveJob() {
  const job = {
    title: document.getElementById("job_title").value,
    description: document.getElementById("job_description").value,
    budget: Number(document.getElementById("job_budget").value || 0),
    client_name: document.getElementById("client_name").value,
    video_url: document.getElementById("video_url").value,
    status: "open"
  };

  try {
    await sb("jobs", {
      method: "POST",
      body: JSON.stringify(job)
    });

    alert("Job posted successfully!");
    jobs();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function apply(id) {
  const editorId = localStorage.getItem("editconnect_editor_id");

  if (!editorId) {
    alert("Please register as an editor first.");
    register();
    return;
  }

  const message = prompt("Write a short message for the client:");

  if (message === null) return;

  try {
    await sb("applications", {
      method: "POST",
      body: JSON.stringify({
        job_id: Number(id),
        editor_id: Number(editorId),
        message: message
      })
    });

    alert("Application submitted successfully!");
  } catch (err) {
    alert("Error: " + err.message);
  }
}

home();
