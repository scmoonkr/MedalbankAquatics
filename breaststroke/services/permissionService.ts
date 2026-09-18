// services/permissionService.ts
import axios from '~/api/axiosInstance';
import { UserModel } from '~/models/users';

interface ResourcePermission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isOwner: boolean;
}

interface ResourceInfo {
  id: number;
  type: string;  // 'page', 'post', 'comment' 등
  ownerId?: number;
  status?: string;
  visibility?: string;
}

/**
 * 권한 확인 서비스
 */
export const permissionService = {
  /**
   * 특정 리소스에 대한 사용자 권한 확인
   */
  async checkResourcePermission(
    resourceType: string,
    resourceId: number,
    user?: UserModel | null
  ): Promise<ResourcePermission> {
    // 로그인하지 않은 경우, 모든 권한 거부
    if (!user) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        isOwner: false
      };
    }

    try {
      // 실제로는 API를 호출하여 서버에서 권한 정보를 가져옵니다.
      const response = await axios.get(`/permissions/${resourceType}/${resourceId}`);
      return response.data;
    } catch (error) {
      console.error(`권한 정보 조회 중 오류(${resourceType} #${resourceId}):`, error);

      // API 오류 시 기본 권한 설정
      // 여기서는 임시로 간단하게 구현하지만, 실제로는 더 복잡한 로직이 필요합니다.
      return {
        canView: true, // 기본적으로 조회는 허용
        canEdit: false, // 기본적으로 편집은 금지
        canDelete: false, // 기본적으로 삭제는 금지
        isOwner: false // 기본적으로 소유자가 아님
      };
    }
  },

  /**
   * 사용자가 리소스의 소유자인지 확인 (로컬 로직)
   */
  isResourceOwner(
    resource: ResourceInfo,
    user: UserModel | null
  ): boolean {
    if (!user || !resource) return false;

    // 관리자는 모든 리소스에 대한 권한을 가짐
    // 이 로직은 실제 애플리케이션에 맞게 조정해야 함
    // if (user.role === 'admin') return true;

    // 리소스에 ownerId가 있고, 현재 사용자와 일치하는지 확인
    return resource.ownerId !== undefined && resource.ownerId === user.userID;
  },

  /**
   * 사용자가 리소스를 편집할 수 있는지 확인 (로컬 로직)
   */
  canEditResource(
    resource: ResourceInfo,
    user: UserModel | null
  ): boolean {
    // 소유자 여부 확인
    const isOwner = this.isResourceOwner(resource, user);

    // 소유자가 아니더라도 관리자는 편집 가능
    // 이 로직은 실제 애플리케이션에 맞게 조정해야 함
    // if (!isOwner && user && user.role === 'admin') return true;

    return isOwner;
  },

  /**
   * 페이지 ID로 편집 권한 확인
   */
  async checkPageEditPermission(
    pageId: number,
    user: UserModel | null
  ): Promise<boolean> {
    if (!user) return false;

    try {
      // 페이지 정보 가져오기
      const pageResponse = await axios.get(`/pages/${pageId}`);
      const pageData = pageResponse.data;

      // 권한 확인 로직
      return this.canEditResource(
        {
          id: pageId,
          type: 'page',
          ownerId: pageData.authorId  // 페이지 작성자 ID
        },
        user
      );
    } catch (error) {
      console.error(`페이지 #${pageId} 권한 확인 중 오류:`, error);
      return false;
    }
  }
};

export default permissionService;