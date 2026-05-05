import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service"
import { AuthRepository } from "./auth.repository";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService (Unit Test)', ()=>{
    let authService: AuthService;

    const mockAuthRepository = {
        validateUser: jest.fn(),
        findByEmail: jest.fn(),
        createUser: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    beforeEach(async () =>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService, 
                { provide: AuthRepository, useValue: mockAuthRepository},
                { provide: JwtService, useValue: mockJwtService}
            ]
        }).compile();

        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe('register()', ()=>{
        it('(+)register', async () => {
            const registerDto = { name: 'Tester Bennington', email: 'test@test.com', password: 'password123' };
            const fakeCreatedUser = { id: 'u-1', name: 'Tester Bennington', email: 'test@test.com', role: 'MEMBER', password: 'hashedpassword123' };
            
            mockAuthRepository.findByEmail.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword123');
            mockAuthRepository.createUser.mockResolvedValue(fakeCreatedUser);
            const result = await authService.register(registerDto);

            expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
            expect(mockAuthRepository.createUser).toHaveBeenCalled();
            expect(result).toEqual({ id: 'u-1', name: 'Tester Bennington', email: 'test@test.com', role: 'MEMBER' });
            expect((result as any).password).toBeUndefined();
        });

        it('(-)register', async ()=>{
            const registerDto = { name: 'Tester Bennington', email: 'test@test.com', password: 'password123' };
            const fakeExistingUser = { id: 'u-2', name: 'Tester Bennington', email: 'test@test.com', role: 'MEMBER', password: 'hashedpassword123' };
            
            mockAuthRepository.findByEmail.mockResolvedValue(fakeExistingUser)
            await expect(authService.register(registerDto)).rejects.toThrow('Email already used');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
        })
    });


    describe('login()', () => {
        it('(+)login', async () => {
            const loginDto = { email: 'test@test.com', password: 'password123' };
            const fakeDbUser = { id: 'u-3', email: 'test@test.com', name: 'Tester Bennington', role: 'MEMBER', password: 'hashedpwd' };
            
            mockAuthRepository.findByEmail = jest.fn().mockResolvedValue(fakeDbUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            
            mockJwtService.signAsync.mockResolvedValue('secretsauce');
            const result = await authService.login(loginDto);

            expect(mockJwtService.signAsync).toHaveBeenCalled();
            expect(result.access_token).toEqual('secretsauce');
            expect(result.user.email).toEqual(loginDto.email);
        });

        it('(-)login', async () => {
            const loginDto = { email: 'test@test.com', password: 'notpassword123' };
            const fakeDbUser = { id: 'u-3', email: 'test@test.com', name: 'Tester Bennington', role: 'MEMBER', password: 'hashedpwd' };
            
            mockAuthRepository.findByEmail = jest.fn().mockResolvedValue(fakeDbUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(authService.login(loginDto)).rejects.toThrow('Invalid credentials');
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });


        it('(-)session', async () => {
            const loginDto = { email: 'whoisthis@test.com', password: 'password123' };
            
            mockAuthRepository.findByEmail = jest.fn().mockResolvedValue(null);
            
            await expect(authService.login(loginDto)).rejects.toThrow('Invalid credentials');
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });
    });
});