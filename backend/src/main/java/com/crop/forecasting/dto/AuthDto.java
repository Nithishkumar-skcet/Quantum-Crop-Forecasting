package com.crop.forecasting.dto;

public class AuthDto {

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class SignupRequest {
        private String username;
        private String email;
        private String password;
        private String fullName;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    public static class JwtAuthResponse {
        private String accessToken;
        private String tokenType = "Bearer";
        private String email;
        private String username;
        private String fullName;

        public JwtAuthResponse(String accessToken, String email, String username, String fullName) {
            this.accessToken = accessToken;
            this.email = email;
            this.username = username;
            this.fullName = fullName;
        }

        public String getAccessToken() { return accessToken; }
        public String getTokenType() { return tokenType; }
        public String getEmail() { return email; }
        public String getUsername() { return username; }
        public String getFullName() { return fullName; }
    }
}
