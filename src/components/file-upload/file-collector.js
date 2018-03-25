export default class FileCollector {
    collectors = [];
    add = (collector) => {
        for (let i = 0; i < this.collectors.length; i++) {
            if (this.collectors[i] == collector) {
                return;
            }
        }
        this.collectors.push(collector);
    }

    remove = (collector) => {
        this.collectors = this.collectors.filter((item) => {
            return item != collector;
        });
    }

    collect = (id) => {
        return this.collectors.reduce((pre, next) => {
            const files = next(id) || [];
            if (files.length > 0) {
                pre.push(...files);
            }
            return pre;
        }, []);
    }
}