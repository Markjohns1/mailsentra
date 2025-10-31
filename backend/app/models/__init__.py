from app.models.user import User
from app.models.spam_log import SpamLog
from app.models.use_feedback import UserFeedback
from app.models.api_key import APIKey
from app.models.email import Email

__all__ = ['User', 'SpamLog', 'UserFeedback', 'APIKey', 'Email'] #__all__ is a special variable that holds the names of the models to import into the app. it is used to tell the app what models to use.

#init file is for importing the models into the app. it is used to tell the app what models to use.