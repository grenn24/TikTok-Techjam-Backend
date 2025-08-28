import { PrismaClient } from "@prisma/client";

class UserService {
	prisma = new PrismaClient();

	// Fetch user by ID
	async getUser(userId: string) {
		try {
			const user = await this.prisma.user.findUnique({
				where: { id: userId },
			});
			if (!user) throw new Error("User not found");
			return user;
		} catch (err) {
			throw err;
		}
	}

	// Update user profile or wallet
	async updateUser(
		userId: string,
		updates: Partial<{ name: string; walletBalance: number }>
	) {
		try {
			const updatedUser = await this.prisma.user.update({
				where: { id: userId },
				data: updates,
			});
			return updatedUser;
		} catch (err) {
			throw new Error("User not found or update failed");
		}
	}

	// Add funds to wallet
	async addToWallet(userId: string, amount: number) {
		try {
			const updatedUser = await this.prisma.user.update({
				where: { id: userId },
				data: {
					walletBalance: {
						increment: amount, // Prisma supports atomic increment
					},
				},
			});
			return updatedUser.walletBalance;
		} catch (err) {
			throw new Error("User not found or failed to add funds");
		}
	}
}

const userService = new UserService();
export default userService;
