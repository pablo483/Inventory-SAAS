package com.inventorysaas.inventory_saas.Controller;

import com.inventorysaas.inventory_saas.DTO.*;
import com.inventorysaas.inventory_saas.Entity.Tenant;
import com.inventorysaas.inventory_saas.Enum.SubscriptionPlan;
import com.inventorysaas.inventory_saas.Service.SuperAdminService;
import com.inventorysaas.inventory_saas.Service.SystemMonitoringService;
import com.inventorysaas.inventory_saas.Service.TenantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SuperAdminControllerTest {

    @Mock
    private TenantService tenantService;

    @Mock
    private SuperAdminService superAdminService;

    @Mock
    private SystemMonitoringService systemMonitoringService;

    @InjectMocks
    private SuperAdminController superAdminController;

    private Tenant testTenant;

    @BeforeEach
    public void setup() {
        testTenant = new Tenant();
        testTenant.setTenantId("test-tenant-123");
        testTenant.setCompanyName("Test Company");
        testTenant.setEmail("test@company.com");
        testTenant.setSubscriptionPlan(SubscriptionPlan.BASIC);
    }

    @Test
    public void testCreateTenant_Success() {
        // Arrange
        TenantCreationRequest request = new TenantCreationRequest();
        // Since we are mocking the service to return testTenant directly upon calling
        // any(),
        // we don't strictly need to set fields in the request, but normally we would.

        when(tenantService.createTenant(any(), any(), any())).thenReturn(testTenant);

        // Act
        ResponseEntity<TenantCreationResponse> response = superAdminController.createTenant(request);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("test-tenant-123", response.getBody().getTenantId());
        assertEquals("Test Company", response.getBody().getCompanyName());
        verify(tenantService, times(1)).createTenant(any(), any(), any());
    }

    @Test
    public void testGetAllTenants_Success() {
        // Arrange
        Page<TenantDetailResponse> mockedPage = new PageImpl<>(Collections.emptyList());
        when(superAdminService.getAllTenants(any(TenantSearchRequest.class),
                any(org.springframework.data.domain.Pageable.class))).thenReturn(mockedPage);

        // Act
        ResponseEntity<Page<TenantDetailResponse>> response = superAdminController.getAllTenants(
                0, 20, null, null, null, "createdAt", "DESC");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockedPage, response.getBody());
    }

    @Test
    public void testGetTenantDetails_Success() {
        // Arrange
        TenantDetailResponse detailResponse = new TenantDetailResponse();
        when(superAdminService.getTenantDetails("test-tenant-123")).thenReturn(detailResponse);

        // Act
        ResponseEntity<TenantDetailResponse> response = superAdminController.getTenantDetails("test-tenant-123");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(detailResponse, response.getBody());
    }

    @Test
    public void testActivateTenant_Success() {
        // Act
        ResponseEntity<Void> response = superAdminController.activateTenant("test-tenant-123");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(superAdminService, times(1)).activateTenant("test-tenant-123");
    }

    @Test
    public void testDeactivateTenant_Success() {
        // Act
        ResponseEntity<Void> response = superAdminController.deactivateTenant("test-tenant-123");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(superAdminService, times(1)).deactivateTenant("test-tenant-123");
    }

    @Test
    public void testDeleteTenant_Success() {
        // Act
        ResponseEntity<Void> response = superAdminController.deleteTenant("test-tenant-123");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(superAdminService, times(1)).deleteTenant("test-tenant-123");
    }

    @Test
    public void testCheckSystemHealth_Success() {
        // Arrange
        SystemHealthResponse healthResponse = new SystemHealthResponse();
        when(systemMonitoringService.checkSystemHealth()).thenReturn(healthResponse);

        // Act
        ResponseEntity<SystemHealthResponse> response = superAdminController.checkSystemHealth();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(healthResponse, response.getBody());
    }
}
