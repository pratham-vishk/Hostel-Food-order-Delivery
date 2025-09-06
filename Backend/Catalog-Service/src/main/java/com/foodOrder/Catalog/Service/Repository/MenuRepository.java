package com.foodOrder.Catalog.Service.Repository;


import com.foodOrder.Catalog.Service.Model.Item;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends CassandraRepository<Item, String> {
}
