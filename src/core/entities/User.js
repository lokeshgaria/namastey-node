// ============================================
// File: src/core/entities/User.entity.js
// ============================================

/**
 * User Entity - Contains BUSINESS RULES for users
 * This is PURE JavaScript - no Mongoose, no Database!
 */
class User {
  constructor({
    id,
    firstName,
    lastName,
    age,
    gender,
    email,
    isPremium = false,
    membershipType = 'free',
    photoUrl,
    about,
    skills = [],
    dailyActions = { likesSent: 0, superLikesSent: 0, messagesSent: 0 }
  }) {
    // Basic properties
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = `${firstName} ${lastName}`.trim();
    this.age = age;
    this.gender = gender;
    this.email = email;
    this.isPremium = isPremium;
    this.membershipType = membershipType;
    this.photoUrl = photoUrl;
    this.about = about;
    this.skills = skills;
    this.dailyActions = dailyActions;
    
    // Derived properties
    this.hasProfilePhoto = !!photoUrl && photoUrl !== 'default';
    this.hasAboutSection = !!about && about !== 'this is a default url here';
    this.profileCompleteness = this.calculateProfileCompleteness();
  }

  // ============================================
  // BUSINESS RULES - What a User CAN DO
  // ============================================

  /**
   * Can user send regular "like"?
   * Free: 50/day, Premium: Unlimited
   */
  canSendLike() {
    if (this.isPremium) return true;
    return this.dailyActions.likesSent < 50;
  }

  /**
   * Can user send "super like"?
   * Free: 1/day, Premium: 5/day
   */
  canSendSuperLike() {
    const dailyLimit = this.isPremium ? 5 : 1;
    return this.dailyActions.superLikesSent < dailyLimit;
  }

  /**
   * Can user send message?
   * Free: 20/day, Premium: Unlimited
   */
  canSendMessage() {
    if (this.isPremium) return true;
    return this.dailyActions.messagesSent < 20;
  }

  /**
   * Can user see who liked them?
   * Only premium users
   */
  canSeeWhoLikedMe() {
    return this.isPremium;
  }

  /**
   * Can user use advanced filters?
   * Premium feature
   */
  canUseAdvancedFilters() {
    return this.isPremium;
  }

  /**
   * Is user eligible for dating based on age?
   * Business rule: Must be 18+
   */
  isEligibleForDating() {
    return this.age >= 18;
  }

  /**
   * Age compatibility with another user
   * Business rule: Max 10 years difference
   */
  isAgeCompatibleWith(otherUserAge) {
    return Math.abs(this.age - otherUserAge) <= 10;
  }

  /**
   * Can user upgrade to premium?
   * Must have complete profile
   */
  canUpgradeToPremium() {
    return this.profileCompleteness >= 70; // At least 70% complete
  }

  /**
   * Calculate profile completeness percentage
   * Business rule for match quality
   */
  calculateProfileCompleteness() {
    let score = 0;
    const maxScore = 100;
    
    if (this.firstName) score += 10;
    if (this.lastName) score += 10;
    if (this.age) score += 15;
    if (this.gender) score += 10;
    if (this.photoUrl && this.hasProfilePhoto) score += 20;
    if (this.about && this.hasAboutSection) score += 15;
    if (this.skills && this.skills.length > 0) score += 20;
    
    return Math.min(score, maxScore);
  }

  /**
   * Get match compatibility score with another user
   * Business algorithm for matching
   */
  getCompatibilityScoreWith(otherUser) {
    let score = 0;
    
    // Age compatibility (30 points max)
    const ageDiff = Math.abs(this.age - otherUser.age);
    if (ageDiff <= 5) score += 30;
    else if (ageDiff <= 10) score += 20;
    else if (ageDiff <= 15) score += 10;
    
    // Shared interests/skills (40 points max)
    if (this.skills && otherUser.skills) {
      const sharedSkills = this.skills.filter(skill => 
        otherUser.skills.includes(skill)
      );
      const skillMatch = (sharedSkills.length / Math.max(this.skills.length, 1)) * 40;
      score += Math.min(skillMatch, 40);
    }
    
    // Profile completeness bonus (30 points max)
    const completenessBonus = (this.profileCompleteness / 100) * 30;
    score += completenessBonus;
    
    return Math.min(score, 100);
  }

  /**
   * Get remaining daily actions
   * For showing limits in UI
   */
  getDailyLimits() {
    return {
      likes: this.isPremium ? 'Unlimited' : 50 - this.dailyActions.likesSent,
      superLikes: this.isPremium ? 5 - this.dailyActions.superLikesSent : 1 - this.dailyActions.superLikesSent,
      messages: this.isPremium ? 'Unlimited' : 20 - this.dailyActions.messagesSent
    };
  }

  /**
   * Increment daily action count
   */
  recordAction(actionType) {
    if (this.dailyActions[actionType] !== undefined) {
      this.dailyActions[actionType] += 1;
    }
  }

  /**
   * Reset daily actions (call this at midnight)
   */
  resetDailyActions() {
    this.dailyActions = {
      likesSent: 0,
      superLikesSent: 0,
      messagesSent: 0
    };
  }

  /**
   * Get user's "match readiness" status
   * Business rule for showing in feed
   */
  getMatchReadiness() {
    if (this.profileCompleteness >= 80) return 'high';
    if (this.profileCompleteness >= 50) return 'medium';
    return 'low';
  }

  /**
   * Validate if user can change profile photo
   * Free: 1/month, Premium: Unlimited
   */
  canChangeProfilePhoto(lastChangeDate) {
    if (this.isPremium) return true;
    
    if (!lastChangeDate) return true;
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return lastChangeDate < oneMonthAgo;
  }
}

module.exports = User;