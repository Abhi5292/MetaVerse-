import { users, claims, type User, type InsertUser, type Claim, type InsertClaim, DAILY_REWARDS } from "@shared/schema";
import { add, isSameDay } from "date-fns";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getLatestClaim(userId: number): Promise<Claim | undefined>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateUserCoins(userId: number, coins: number): Promise<User>;
  updateUserTokens(userId: number, tokens: number): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private claims: Map<number, Claim>;
  private currentUserId: number;
  private currentClaimId: number;

  constructor() {
    this.users = new Map();
    this.claims = new Map();
    this.currentUserId = 1;
    this.currentClaimId = 1;

    // Initialize a demo user
    this.createUser({
      username: "demo",
      password: "demo"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      metaCoins: 0,
      tokens: 0
    };
    this.users.set(id, user);
    return user;
  }

  async getLatestClaim(userId: number): Promise<Claim | undefined> {
    return Array.from(this.claims.values())
      .filter(claim => claim.userId === userId)
      .sort((a, b) => b.claimedAt.getTime() - a.claimedAt.getTime())[0];
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = this.currentClaimId++;
    const claim: Claim = {
      ...insertClaim,
      id,
      claimedAt: new Date(),
    };
    this.claims.set(id, claim);
    return claim;
  }

  async updateUserCoins(userId: number, coins: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      metaCoins: user.metaCoins + coins
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserTokens(userId: number, tokens: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      tokens: user.tokens + tokens
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();