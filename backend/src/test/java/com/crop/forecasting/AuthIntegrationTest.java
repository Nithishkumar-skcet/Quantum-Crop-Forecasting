package com.crop.forecasting;

import com.crop.forecasting.dto.AuthDto;
import com.crop.forecasting.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

    @Test
    public void testAuthenticationFlow() {
        System.out.println("======================================================================");
        System.out.println("   AUTHENTICATION INTEGRATION TEST");
        System.out.println("======================================================================");

        String testUsername = "farmer_test_" + System.currentTimeMillis();
        String testEmail = "test_" + System.currentTimeMillis() + "@agri.com";
        String testPassword = "securePassword123";

        // 1. Test Register
        AuthDto.SignupRequest signupReq = new AuthDto.SignupRequest();
        signupReq.setUsername(testUsername);
        signupReq.setEmail(testEmail);
        signupReq.setPassword(testPassword);
        signupReq.setFullName("Test Farmer");

        AuthDto.JwtAuthResponse regResp = authService.register(signupReq);
        assertNotNull(regResp.getAccessToken());
        assertEquals(testEmail, regResp.getEmail());
        assertEquals(testUsername, regResp.getUsername());
        System.out.println("[PASS] User Registration Success. JWT Generated.");

        // 2. Test Duplicate Email Prevention
        Exception dupEx = assertThrows(RuntimeException.class, () -> {
            authService.register(signupReq);
        });
        assertTrue(dupEx.getMessage().contains("already registered"));
        System.out.println("[PASS] Duplicate Registration Blocked.");

        // 3. Test Short Password Validation
        AuthDto.SignupRequest weakReq = new AuthDto.SignupRequest();
        weakReq.setUsername("weak_user");
        weakReq.setEmail("weak@agri.com");
        weakReq.setPassword("123");
        Exception weakEx = assertThrows(RuntimeException.class, () -> {
            authService.register(weakReq);
        });
        assertTrue(weakEx.getMessage().contains("at least 6 characters"));
        System.out.println("[PASS] Weak Password Blocked.");

        // 4. Test Valid Login
        AuthDto.LoginRequest loginReq = new AuthDto.LoginRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword(testPassword);

        AuthDto.JwtAuthResponse loginResp = authService.login(loginReq);
        assertNotNull(loginResp.getAccessToken());
        assertEquals(testEmail, loginResp.getEmail());
        System.out.println("[PASS] User Login Success.");

        // 5. Test Invalid Password Login
        AuthDto.LoginRequest wrongLogin = new AuthDto.LoginRequest();
        wrongLogin.setEmail(testEmail);
        wrongLogin.setPassword("wrongPass");

        Exception wrongEx = assertThrows(RuntimeException.class, () -> {
            authService.login(wrongLogin);
        });
        assertTrue(wrongEx.getMessage().contains("Invalid email or password"));
        System.out.println("[PASS] Invalid Password Blocked.");

        // 6. Test Get Profile
        Map<String, Object> profile = authService.getCurrentUser(testEmail);
        assertEquals(testEmail, profile.get("email"));
        assertEquals(testUsername, profile.get("username"));
        System.out.println("[PASS] User Profile Retrieval Success.");

        System.out.println("======================================================================");
        System.out.println("   ALL AUTHENTICATION INTEGRATION TESTS PASSED 100%");
        System.out.println("======================================================================");
    }
}
