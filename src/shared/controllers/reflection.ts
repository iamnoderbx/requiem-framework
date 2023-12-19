export default new class {
    private classes = new Map<object, Record<string, unknown>>()
    public onComponentEvent = new Instance("BindableEvent")

    public onComponentAdded<T>(instance : Instance, newClass : object) {
        this.onComponentEvent.Fire(instance, newClass)
    }

    public addMetaTagToClass(constructor : object, key : string, value : unknown) {
        if(!this.classes.has(constructor)) {
            this.classes.set(constructor, {})
        }

        const classMeta = this.classes.get(constructor)
        if(classMeta) {
            classMeta[key] = value
        }
    }

    public getClassesWithMetaTag(tag : string) {
        const classes = new Array<object>()
        this.classes.forEach((value, key) => {
            if(value[tag]) {
                classes.push(key)
            }
        })

        return classes
    }

    public getClassMetaTag(constructor : object, tag : string) {
        const classMeta = this.classes.get(constructor)
        if(classMeta) {
            return classMeta[tag]
        }
    }

    public getClassesWithMetaTags(tags : string[]) {
        const classes = new Array<object>()
        this.classes.forEach((value, key) => {
            let hasAllTags = true
            tags.forEach((tag) => {
                if(!value[tag]) {
                    hasAllTags = false
                }
            })

            if(hasAllTags) {
                classes.push(key)
            }
        })

        return classes
    }
}