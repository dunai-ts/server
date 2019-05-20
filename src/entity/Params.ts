import { Type } from '@dunai/core';
import { checkController, EntitySource } from '../controller/Common';

/**
 * Resolve entity by parameter
 * @param entity
 * @decorator
 */
export function Entity(entity: EntitySource) {
    return (controller: Type<any>, propertyKey: string, index: number) => {
        const target = checkController(controller);

        if (!(propertyKey in target._route_entity))
            target._route_entity[propertyKey] = [];

        target._route_entity[propertyKey][index] = entity;
    };
}
