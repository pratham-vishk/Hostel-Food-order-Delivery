package com.foodOrder.Catalog.Service.Controller;

import com.foodOrder.Catalog.Service.Model.Item;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@Controller
public interface MenuControllerAPI {
    /**
     * GET /items : Get all items
     *
     * @return List of items (status code 200)
     */
    @Operation(
            operationId = "itemsGet",
            summary = "Get all items",
            responses = {
                    @ApiResponse(responseCode = "200", description = "List of items", content = {
                            @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Item.class)))
                    })
            }
    )
    @RequestMapping(
            method = RequestMethod.GET,
            value = "/items",
            produces = {"application/json"}
    )
    ResponseEntity<List<Item>> itemsGet(

    );


    /**
     * GET /items/{id} : Get item by ID
     *
     * @param id (required)
     * @return Item found (status code 200)
     * or Item not found (status code 404)
     */
    @Operation(
            operationId = "itemsIdGet",
            summary = "Get item by ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Item found", content = {
                            @Content(mediaType = "application/json", schema = @Schema(implementation = Item.class))
                    }),
                    @ApiResponse(responseCode = "404", description = "Item not found")
            }
    )
    @RequestMapping(
            method = RequestMethod.GET,
            value = "/items/{id}",
            produces = {"application/json"}
    )
    ResponseEntity<Item> itemsIdGet(
            @Parameter(name = "id", description = "", required = true, in = ParameterIn.PATH) @PathVariable("id") String id
    );


    /**
     * PUT /items/{id} : Update item by ID
     *
     * @param id   (required)
     * @param item (required)
     * @return Item updated successfully (status code 200)
     * or Item not found (status code 404)
     */
    @Operation(
            operationId = "itemsIdPut",
            summary = "Update item by ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Item updated successfully"),
                    @ApiResponse(responseCode = "404", description = "Item not found")
            }
    )
    @RequestMapping(
            method = RequestMethod.PUT,
            value = "/items/{id}",
            consumes = {"application/json"}
    )
    ResponseEntity<Void> itemsIdPut(
            @Parameter(name = "id", description = "", required = true, in = ParameterIn.PATH) @PathVariable("id") String id,
            @Parameter(name = "Item", description = "", required = true) @Valid @RequestBody Item item
    );


    /**
     * POST /items : Add a new item
     *
     * @param item (required)
     * @return Item created successfully (status code 201)
     */
    @Operation(
            operationId = "itemsPost",
            summary = "Add a new item",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Item created successfully")
            }
    )
    @RequestMapping(
            method = RequestMethod.POST,
            value = "/items",
            consumes = {"application/json"}
    )
    ResponseEntity<Void> itemsPost(
            @Parameter(name = "Item", description = "", required = true) @Valid @RequestBody Item item
    );
}