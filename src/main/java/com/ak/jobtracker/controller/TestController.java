package com.ak.jobtracker.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class TestController {

    @PostMapping("/test")
    public String test(@RequestBody Map<String, String> data) {
        return "Connection Successful! Received: " + data.get("name");
    }

    @GetMapping("/ping")
    public String ping() { return "pong"; }
}
