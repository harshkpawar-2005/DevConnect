import cron from "node-cron";
import { Project } from "../models/project.model.js";

export const startProjectExpiryJob = () => {

  // Runs every hour
  cron.schedule("0 * * * *", async () => {

    try {
      const now = new Date();

      await Project.updateMany(
        {
          deadline: { $lt: now },
          status: "open"
        },
        {
          $set: {
            status: "expired",
            open: false
          }
        }
      );

      console.log("Project expiry job executed successfully");

    } catch (error) {
      console.error("Error in project expiry job:", error);
    }

  });

};
