const initialState = {
  helpRequests: [],
  resources: [],
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_HELP_REQUEST':
      return {
        ...state,
        helpRequests: [...state.helpRequests, action.payload],
      };
    case 'UPDATE_HELP_REQUEST':
      return {
        ...state,
        helpRequests: state.helpRequests.map((request) =>
          request.id === action.payload.id ? action.payload : request
        ),
      };
    case 'DELETE_HELP_REQUEST':
      return {
        ...state,
        helpRequests: state.helpRequests.filter(
          (request) => request.id !== action.payload
        ),
      };
    case 'SET_HELP_REQUESTS':
      return {
        ...state,
        helpRequests: action.payload,
      };
    case 'ADD_RESOURCE':
      return {
        ...state,
        resources: [...state.resources, action.payload],
      };
    case 'UPDATE_RESOURCE':
      return {
        ...state,
        resources: state.resources.map((resource) =>
          resource.id === action.payload.id ? action.payload : resource
        ),
      };
    case 'DELETE_RESOURCE':
      return {
        ...state,
        resources: state.resources.filter(
          (resource) => resource.id !== action.payload
        ),
      };
    case 'SET_RESOURCES':
      return {
        ...state,
        resources: action.payload,
      };
    default:
      return state;
  }
};

export default dashboardReducer;
