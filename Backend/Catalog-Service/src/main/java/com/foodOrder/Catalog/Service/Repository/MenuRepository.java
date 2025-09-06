package com.foodOrder.Catalog.Service.Repository;


import com.foodOrder.Catalog.Service.Model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<Item, String> {
}
