class Util {
  message = {
    salesforce: {
      loginAttempt: 'Attempting to login.',
      loginSuccess: 'Login successful.',
      loginError: 'Invalid username, password, security token; or user locked out.',
    },
    internalServerError: 'Internal server error.',
    metadata: {
      notFound: 'Metadata was not found.',
    },
    organization: {
      notFound: 'Organization was not found.',
    },
    backup: {
      retrieveProblem: 'There was a problem retrieving backup organization details.',
      notFound: 'Backup was not found.',
    },
  };

  code = {
    ok: 200,
    created: 201,
    deleted: 204,
    bad: 400,
    forbidden: 401,
    notFound: 404,
    internalServerError: 500,
  };

  constant = {
    day: 60*60*24,
    week: 60*60*24*7,
    month: 60*60*24*7*4,
  };
}

export default new Util();
