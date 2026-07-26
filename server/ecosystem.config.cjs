module.exports = {
  apps: [
    {
      name: "mishkwat-backend", // The name of the process
      script: "./server.js",    // The entry point of your application
      instances: "max",         // "max" uses all available CPU cores. Alternatively, use a number like 4
      exec_mode: "cluster",     // Runs your app in cluster mode (load balancing across cores)
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }
  ]
};
