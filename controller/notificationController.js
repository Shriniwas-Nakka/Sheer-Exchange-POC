const {
  readNotifications,
  viewNotification,
} = require("../model/notificationModel");
const response = {};

class NotificationController {
  readNotificationsController = (req, res, next) => {
    let data = {
      userId: req.token._id,
    };
    readNotifications(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "Retrieved all notifications !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  viewNotificationController = (req, res, next) => {
    let data = {
      notificationId: req.params.notificationId,
    };
    viewNotification(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "Notification viewed !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };
}

module.exports = new NotificationController();
