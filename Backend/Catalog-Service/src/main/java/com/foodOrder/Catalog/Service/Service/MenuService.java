package com.foodOrder.Catalog.Service.Service;

import com.foodOrder.Catalog.Service.Model.Item;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface MenuService {
    List<Item> getAllItems();

    Item getItemById(String id);

    Void updateItem(String id, Item item);

    Void addItem(Item item);
}
