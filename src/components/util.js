
export function isEmpty(str) {
    return (!str || str.length === 0 );
}

function deleteFromObject(keyPart, obj){
    for (var k in obj){          // Loop through the object
        if(~k.indexOf(keyPart)){ // If the current key contains the string we're looking for
            delete obj[k];       // Delete obj[key];
        }
    }
}

export function defaultValidation(entity, remove_keys){
    const copiedEntity = {...entity};
    
    remove_keys.forEach(key => deleteFromObject(key, copiedEntity))
    
    const hasNull = Object.values(copiedEntity).some(val => isEmpty(val)); 
    const isValid = !hasNull        
    return isValid;
}