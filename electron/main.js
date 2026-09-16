const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const fs = require("fs");

// =====================================================
// CUSTOM PROTOCOL: faith://
// =====================================================
protocol.registerSchemesAsPrivileged([
  {
    scheme: "faith",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

// =====================================================
// CREATE WINDOW
// =====================================================
function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,

    minWidth: 1100,
    minHeight: 700,

    title: "FaithEdu",

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // ===================================================
  // DEVELOPMENT
  // ===================================================
  if (!app.isPackaged) {
    win.loadURL("http://localhost:3000");

    return;
  }

  // ===================================================
  // PRODUCTION
  // ===================================================
  win.loadURL("faith://app/index.html");

  // Tạm mở DevTools để kiểm tra nếu cần
  // win.webContents.openDevTools();
}

// =====================================================
// APP READY
// =====================================================
app.whenReady().then(() => {
  // ===================================================
  // CUSTOM PROTOCOL HANDLER
  // ===================================================
  if (app.isPackaged) {
    protocol.handle("faith", async (request) => {
      try {
        const url = new URL(request.url);

        let filePath;

        // -----------------------------------------------
        // INDEX
        // faith://app/index.html
        // -----------------------------------------------
        if (url.pathname === "/" || url.pathname === "/index.html") {
          filePath = path.join(__dirname, "../build/index.html");
        } else {
          // ---------------------------------------------
          // STATIC FILES
          // faith://app/static/...
          // ---------------------------------------------
          const relativePath = decodeURIComponent(url.pathname).replace(
            /^\/+/,
            "",
          );

          filePath = path.join(__dirname, "../build", relativePath);
        }

        console.log("FAITH REQUEST:", request.url);
        console.log("FILE PATH:", filePath);

        // -----------------------------------------------
        // CHECK FILE
        // -----------------------------------------------
        if (!fs.existsSync(filePath)) {
          console.error("FILE NOT FOUND:", filePath);

          return new Response("File not found", {
            status: 404,
          });
        }

        // -----------------------------------------------
        // MIME TYPES
        // -----------------------------------------------
        const extension = path.extname(filePath).toLowerCase();

        const mimeTypes = {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript; charset=utf-8",
          ".css": "text/css; charset=utf-8",

          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".svg": "image/svg+xml",
          ".webp": "image/webp",
          ".ico": "image/x-icon",

          ".json": "application/json; charset=utf-8",

          ".woff": "font/woff",
          ".woff2": "font/woff2",
          ".ttf": "font/ttf",
          ".otf": "font/otf",
        };

        const mimeType = mimeTypes[extension] || "application/octet-stream";

        // -----------------------------------------------
        // RETURN FILE
        // -----------------------------------------------
        return new Response(fs.createReadStream(filePath), {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "no-cache",
          },
        });
      } catch (error) {
        console.error("FAITH PROTOCOL ERROR:", error);

        return new Response("Internal Server Error", {
          status: 500,
        });
      }
    });
  }

  // ===================================================
  // CREATE WINDOW
  // ===================================================
  createWindow();

  // ===================================================
  // MACOS ACTIVATE
  // ===================================================
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// =====================================================
// CLOSE APP
// =====================================================
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
