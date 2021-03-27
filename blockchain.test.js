const Blockchain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('./crypto-hash');
describe('Blockchain' , ()=>{
    let blockchain , newchain , originalChain;

    beforeEach(()=>{
        blockchain = new Blockchain();
        newchain = new Blockchain();
        originalChain = blockchain.chain;
    })


    it('contains a `chain` Array instance' , ()=>{
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with a genesis block' , ()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain' , ()=>{
        const newData = 'foo bar';
        blockchain.addBlock({data : newData});
    expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
});
describe('isValidChain()' , ()=>{
    describe('when the chain does not start with the genesis block and has multiple blocks' , ()=>{
        it('returns false' , ()=>{
            blockchain.chain[0] = {data : 'fake-genesis'};
            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
    });
    describe('when the chain starts with the genesis block and has multiple blocks' , ()=>{
        beforeEach(()=>{
                blockchain.addBlock({data : "Billa"});
                blockchain.addBlock({data : "ranga"});
                blockchain.addBlock({data : "Baasha"});
        });
        describe('and a lasthash reference has changed' , ()=>{
            it('returns false',()=>{
                
                blockchain.chain[2].lastHash = 'broken-lastHash';
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });
        describe('and a chain contains block with invalid field' , ()=>{
            it('returns false',()=>{
                blockchain.chain[2].data = 'some-bad-and-evil-data';
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('and the chain  contains a block with jumped difficulty' , ()=>{
            it('returns fasle' , ()=>{
                const lastBlock = blockchain.chain[blockchain.chain.length-1];
                const lastHash = lastBlock.hash;
                const timestamp = Date.now();
                const nonce = 0;
                const data = [];
                const difficulty = lastBlock.difficulty-3;

                const hash = cryptoHash(timestamp , lastHash , difficulty , nonce , data);

                const badBlock = new Block({timestamp , lastHash , hash , nonce , difficulty , data}); 
                blockchain.chain.push(badBlock);
            
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

            });
        });
        describe('and a chain does not contain any  block with invalid field' , ()=>{
            it('returns true',()=>{
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
            });
        });

    });
});

describe('replaceChain()',()=>{
    let errorMock , logMock;
    beforeEach(()=>{
        errorMock = jest.fn();
        logMock = jest.fn();

        global.console.error = errorMock;
        global.console.log = logMock;

    })

    describe('when the new chain is not longer' , ()=>{
        beforeEach(()=>{
            newchain.chain[0] = {new : 'chain'};
            blockchain.replaceChain(newchain.chain);
        })
        
        
        it('does not replace the chain' , ()=>{  
            expect(blockchain.chain).toEqual(originalChain);
        });

        it('logs an error' , ()=>{
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('when the new chain is longer' , ()=>{
        beforeEach(()=>{
            newchain.addBlock({data : "Billa"});
            newchain.addBlock({data : "ranga"});
            newchain.addBlock({data : "Baasha"});
    });
        describe('and the chain is invalid' , ()=>{
            beforeEach(()=>{
                newchain.chain[2].hash='some-fake-hash';
                blockchain.replaceChain(newchain.chain);
            })
            it('does not replace the chain' , ()=>{
                
            expect(blockchain.chain).toEqual(originalChain);

            });
            it('logs an error' , ()=>{
                expect(errorMock).toHaveBeenCalled();
            });

        });

        describe('and the chain is valid' , ()=>{
            beforeEach(()=>{
                blockchain.replaceChain(newchain.chain);
            });
            it('replaces the chain' , ()=>{
                expect(blockchain.chain).toEqual(newchain.chain);
            });

            it('logs about the chain replacement' , ()=>{
                expect(logMock).toHaveBeenCalled();
            })
        })
    })
})





});