import "reflect-metadata";
import { container } from "tsyringe";
import StabJournalRepository from "@/app/repository/stab/StabJournalRepository";
import StabUserRepository from "@/app/repository/stab/StabUserRepository";
// import config from "config";
import firebase from "firebase/app";
// import "firebase/firestore";
import IJournalRepository from "@/app/repository/interface/IJournalRepository";
import IUserRepository from "@/app/repository/interface/IUserRepository";
import JournalRepository from "@/app/repository/JournalRepository";
import ICategoryItemMasterRepository from "@/app/repository/interface/ICategoryItemMasterRepository";
import CategoryItemMasterRepository from "@/app/repository/CategoryItemMasterRepository";
import ICategoryMasterRepository from "@/app/repository/interface/ICategoryMasterRepository";
import CategoryMasterRepository from "@/app/repository/CategoryMasterRepository";
import TemplateRepository from "@/app/repository/TemplateRepository";
import ITemplateRepository from "@/app/repository/interface/ITemplateRepository";
import IUserCreationMasterRepository from "@/app/repository/interface/IUserCreationMasterRepository";
import UserCreationMasterRepository from "@/app/repository/UserCreationMasterRepository";
import UserRepository from "@/app/repository/UserRepository";
import StabCategoryMasterRepository from "@/app/repository/stab/StabCategoryMasterRepository";
import StabTemplateRepository from "@/app/repository/stab/StabTemplateRepository";
import StabUserCreationMasterRepository from "@/app/repository/stab/StabUserCreationMasterRepository";
import BalanceFirestore from "../repository/firestore/BalanceFirestore";
import HistoryFirestore from "../repository/firestore/HistoryFirestore";
/**
 * DI管理用クラス
 */
export default class DependencyInjectionConfig {
  /**
   * 本番用DIを登録する
   */
  public static runWeb(): void {
    try {
      firebase.initializeApp({
        apiKey: "AIzaSyD88NWYMMUOegAM5dMBZAG_l3sjdewkgRI",
        projectId: "cactack-light",
      });
    } catch (e) {
      console.error("Error on init firebase");
    }
    container.register<ICategoryItemMasterRepository>(
      "CategoryItemMasterRepository",
      {
        useClass: CategoryItemMasterRepository,
      }
    );
    container.register<ICategoryMasterRepository>("CategoryMasterRepository", {
      useClass: CategoryMasterRepository,
    });
    container.register<IJournalRepository>("JournalRepository", {
      useClass: JournalRepository,
    });
    container.register<ITemplateRepository>("TemplateRepository", {
      useClass: TemplateRepository,
    });
    container.register<IUserCreationMasterRepository>(
      "UserCreationMasterRepository",
      {
        useClass: UserCreationMasterRepository,
      }
    );
    container.register<IUserRepository>("UserRepository", {
      useClass: UserRepository,
    });
    container.register<BalanceFirestore>("BalanceFirestore", {
      useClass: BalanceFirestore,
    });
    container.register<HistoryFirestore>("HistoryFirestore", {
      useClass: HistoryFirestore,
    });
  }

  /**
   * テスト用のDIを登録する
   */
  public static runLocal(): void {
    container.register<ICategoryItemMasterRepository>(
      "CategoryItemMasterRepository",
      {
        useClass: CategoryItemMasterRepository,
      }
    );
    container.register<ICategoryMasterRepository>("CategoryMasterRepository", {
      useClass: StabCategoryMasterRepository,
    });
    container.register<IJournalRepository>("JournalRepository", {
      useClass: StabJournalRepository,
    });
    container.register<ITemplateRepository>("TemplateRepository", {
      useClass: StabTemplateRepository,
    });
    container.register<IUserCreationMasterRepository>(
      "UserCreationMasterRepository",
      {
        useClass: StabUserCreationMasterRepository,
      }
    );
    container.register<IUserRepository>("UserRepository", {
      useClass: StabUserRepository,
    });
  }

  public static run() {
    // if (config.TARGET === "web") {
      DependencyInjectionConfig.runWeb();
      return;
    // }
    // DependencyInjectionConfig.runLocal();
  }
}
