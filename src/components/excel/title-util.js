var TitleUtil = {
    format: function (element) {
        if (element.format) {
            return 'format = "' + element.format + '"';
        } else {
            return '';
        }
    },
    get: function (json) {
        let content =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<exl-title-list xmlns="http://schema.amugua.com/exl-title-list"\n' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
            'xsi:schemaLocation="http://schema.amugua.com/exl-title-list http://schema.amugua.com/exl-title-list/exl-title-list.xsd">\n' +
            '<exlTitles>\n';
        let deep = TitleUtil.getDeep(json);
        let level = 0;
        for (let i = 0; i < json.length; i++) {
            let element = json[i];
            let colspan = TitleUtil.getColspan(element);
            let rowspan = 1;
            //如果下层已经没孩子了，补齐rowspan
            if (element.children == null) {
                rowspan = deep - level;
            }
            let name = element.name;
            if (element.title) {
                name = element.title;
            }
            content += '<exlTitle name="' + name + '" title="' + (element.key ? element.key : "") +
                '" colspan="' + colspan + '" rowspan="' + rowspan + '" group="' + (element.group ? element.group : false) + '" '
                + TitleUtil.format(element) + '>\n' +
                TitleUtil.getChildren(element.children, deep, level + 1)
                + '</exlTitle >\n'
        }
        content += '</exlTitles>\n'
        content += '</exl-title-list>';

        return content;
    },

    getChildren: function (children, deep, level) {
        if (children == null) {
            return '';
        }
        let content = '';
        for (let i = 0; i < children.length; i++) {
            let element = children[i];
            let colspan = TitleUtil.getColspan(element);
            let rowspan = 1;
            //如果下层已经没孩子了，补齐rowspan
            if (element.children == null) {
                rowspan = deep - level;
            }
            let name = element.name;
            if (element.title) {
                name = element.title;
            }
            content += '<children name="' + name + '" title="' + (element.key ? element.key : "") + '" colspan="' + colspan +
                '" rowspan="' + rowspan + '" group="' + (element.group ? element.group : false) + '" '
                + TitleUtil.format(element) + '>' +
                TitleUtil.getChildren(element.children, deep, level + 1)
                + '</children >\n'
        }
        return content;

    },

    getColspan: function (element) {
        if (element.children == null) {
            return 1;
        }
        let colspan = 0;
        for (let i = 0; i < element.children.length; i++) {
            colspan += TitleUtil.getColspan(element.children[i]);
        }
        return colspan;

    },

    getDeep: function (titles) {
        if (titles == null) {
            return 0;
        }
        let level = 0;
        let maxLevel = level;
        for (let i = 0; i < titles.length; i++) {
            let element = titles[i];
            level = TitleUtil.getDeep(element.children);
            if (maxLevel < level) {
                maxLevel = level;
            }
        }
        level = maxLevel + 1;
        return level;

    },
}

export default TitleUtil;