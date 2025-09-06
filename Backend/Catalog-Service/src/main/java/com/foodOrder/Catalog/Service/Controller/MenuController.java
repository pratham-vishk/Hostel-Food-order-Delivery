package com.foodOrder.Catalog.Service.Controller;

import com.foodOrder.Catalog.Service.Service.MenuService;
import com.foodOrder.Catalog.Service.Model.Item;
import org.springframework.http.ResponseEntity;

import java.util.List;

public class MenuController implements MenuControllerAPI {


    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @Override
    public ResponseEntity<List<Item>> itemsGet() {
        return ResponseEntity.ok().body(this.menuService.getAllItems());
    }

    @Override
    public ResponseEntity<Item> itemsIdGet(String id) {
        return ResponseEntity.ok().body(this.menuService.getItemById(id));
    }

    @Override
    public ResponseEntity<Void> itemsIdPut(String id, Item item) {
        return ResponseEntity.ok().body(this.menuService.updateItem(id, item));
    }

    @Override
    public ResponseEntity<Void> itemsPost(Item item) {
        return ResponseEntity.ok().body(this.menuService.addItem(item));
    }
}
