package com.foodOrder.Catalog.Service.Service.Implementation;

import com.foodOrder.Catalog.Service.Repository.MenuRepository;
import com.foodOrder.Catalog.Service.Service.MenuService;
import com.foodOrder.Catalog.Service.Model.Item;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuServiceImple implements MenuService {
    
    private final MenuRepository menuRepository;

    public MenuServiceImple(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    @Override
    public List<Item> getAllItems() {
        return this.menuRepository.findAll();
    }

    @Override
    public Item getItemById(String id) {
        return this.menuRepository.findById(id).orElse(null);
    }

    @Override
    public Void updateItem(String id, Item item) {
        return this.updateItem(id, item);
    }

    @Override
    public Void addItem(Item item) {
        return this.addItem(item);
    }
}
