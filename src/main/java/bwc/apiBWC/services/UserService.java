package bwc.apiBWC.services;

import bwc.apiBWC.dtos.request.SignUpRequest;
import bwc.apiBWC.entities.User;

public interface UserService {
    User registerUser(SignUpRequest signUpRequest);
}
