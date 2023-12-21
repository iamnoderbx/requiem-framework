import { MetadataEvent } from "shared/utilities/event/MetadataEvent"

export default new class {
    /**
     * A private member 'classes' that holds a map of classes and their associated metadata.
     * The keys of the map are objects (the classes), and the values are records with string keys and unknown values (the metadata).
     * 
     * @private
     * @type {Map<object, Record<string, unknown>>}
     */
    private classes = new Map<object, Record<string, unknown>>()

    /**
     * A public member 'onComponentEvent' that holds an instance of 'BindableEvent'.
     * This can be used to fire or listen to events related to components.
     * 
     * @public
     * @type {Instance}
     */
    public onComponentEvent = new MetadataEvent()

    /**
     * The 'onComponentAdded' method fires an event when a new component is added to an instance.
     * 
     * @method onComponentAdded
     * @param {Instance} instance - The instance to which the component is added.
     * @param {object} newClass - The new component that is added.
     * @returns {void}
     * @author NodeSupport
     */
    public onComponentAdded<T>(instance : Instance, newClass : object) {
        // Fire the 'onComponentEvent' with the instance and the new component as arguments.
        this.onComponentEvent.Fire(instance, newClass)
    }

    /**
     * The 'addMetaTagToClass' method adds a meta tag to a class.
     * 
     * @method addMetaTagToClass
     * @param {object} constructor - The constructor of the class to which the meta tag is added.
     * @param {string} key - The key of the meta tag.
     * @param {unknown} value - The value of the meta tag.
     * @returns {void}
     * @author NodeSupport
     */
    public addMetaTagToClass(constructor : object, key : string, value : unknown) {
        // If the class does not exist in the map of classes...
        if(!this.classes.has(constructor)) {
            // Add the class to the map with an empty object as its value.
            this.classes.set(constructor, {})
        }

        // Get the meta data of the class.
        const classMeta = this.classes.get(constructor)
        // If the meta data exists...
        if(classMeta) {
            // Add the meta tag to the meta data.
            classMeta[key] = value
        }
    }

    /**
     * The 'getClassesWithMetaTag' method returns an array of classes that have a specific meta tag.
     * 
     * @method getClassesWithMetaTag
     * @param {string} tag - The meta tag to search for.
     * @returns {object[]} An array of classes that have the specified meta tag.
     * @author NodeSupport
     */
    public getClassesWithMetaTag(tag : string) {
        // Initialize an array to store the classes that have the meta tag.
        const classes = new Array<object>()

        // Iterate over each class in the map of classes.
        this.classes.forEach((value, key) => {
            // If the class has the meta tag...
            if(value[tag]) {
                // Add the class to the array of classes.
                classes.push(key)
            }
        })

        // Return the array of classes.
        return classes
    }

    /**
     * The 'getClassMetaTag' method returns the value of a specific meta tag for a class.
     * 
     * @method getClassMetaTag
     * @param {object} constructor - The constructor of the class from which to get the meta tag.
     * @param {string} tag - The meta tag to get.
     * @returns {unknown} The value of the meta tag, or undefined if the class does not have the meta tag.
     * @author NodeSupport
     */
    public getClassMetaTag(constructor : object, tag : string) {
        // Get the meta data of the class.
        const classMeta = this.classes.get(constructor)
        // If the meta data exists...
        if(classMeta) {
            // Return the value of the meta tag.
            return classMeta[tag]
        }
    }

    /**
     * The 'getClassesWithMetaTags' method returns an array of classes that have all specified meta tags.
     * 
     * @method getClassesWithMetaTags
     * @param {string[]} tags - The array of meta tags to search for.
     * @returns {object[]} An array of classes that have all the specified meta tags.
     * @author NodeSupport
     */
    public getClassesWithMetaTags(tags : string[]) {
        // Initialize an array to store the classes that have all the meta tags.
        const classes = new Array<object>()

        // Iterate over each class in the map of classes.
        this.classes.forEach((value, key) => {
            // Assume that the class has all the meta tags.
            let hasAllTags = true

            // Iterate over each tag.
            tags.forEach((tag) => {
                // If the class does not have the tag...
                if(!value[tag]) {
                    // Set 'hasAllTags' to false.
                    hasAllTags = false
                }
            })

            // If the class has all the tags...
            if(hasAllTags) {
                // Add the class to the array of classes.
                classes.push(key)
            }
        })

        // Return the array of classes.
        return classes
    }
}