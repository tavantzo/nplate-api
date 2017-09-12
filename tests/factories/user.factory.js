import faker from 'faker';

class UserFactory {
    generateList(count, attrs = {}) {
        let list = []
        while (count) {
            list.push(this.generate(attrs));
            count--;
        }
        return list;
    }

    generate(attrs) {
        return Object.assign({}, {
            firstname: faker.name.firstName(),
            lastname: faker.name.lastName(),
            nickname: faker.internet.userName(),
            mobile: faker.phone.phoneNumber(),
            devices: [
                { name: faker.random.word, signature: faker.random.passward },
                { signature: faker.random.word, signature: faker.random.passward },
            ],
        }, attrs);
    }
}

export default new UserFactory();
